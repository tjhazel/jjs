using System.Net;
using System.Text;
using System.Text.Json;
using JJS.Api.Models.Configuration;
using JJS.Api.Services;
using JJS.Api.Tests.Fakes;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace JJS.Api.Tests.Services;

[TestFixture]
public class CommentModerationServiceTest
{
    private IHttpClientFactory _factory = null!;
    private ILogger<CommentModerationService> _logger = null!;

    [SetUp]
    public void SetUp()
    {
        _factory = Substitute.For<IHttpClientFactory>();
        _logger  = Substitute.For<ILogger<CommentModerationService>>();
    }

    private CommentModerationService CreateService(AppSetting setting) =>
        new(_factory, setting, _logger);

    private static AppSetting ConfiguredSetting => new()
    {
        GeminiApiUrl = "https://gemini.test/api",
        GeminiApiKey = "test-key",
    };

    private void SetupHttpClient(HttpResponseMessage response)
    {
        var client = new HttpClient(new FakeHttpMessageHandler(response));
        _factory.CreateClient(Arg.Any<string>()).Returns(client);
    }

    private void SetupHttpClientError(Exception ex)
    {
        var client = new HttpClient(new ErrorHttpMessageHandler(ex));
        _factory.CreateClient(Arg.Any<string>()).Returns(client);
    }

    // Wraps a ModerationResult JSON string in the Gemini candidates/content/parts envelope
    private static string GeminiEnvelope(bool isSpam, bool isToxic, string reason)
    {
        var inner = JsonSerializer.Serialize(new { IsSpam = isSpam, IsToxic = isToxic, Reason = reason });
        return JsonSerializer.Serialize(new
        {
            candidates = new[]
            {
                new { content = new { parts = new[] { new { text = inner } } } }
            }
        });
    }

    private static HttpResponseMessage OkResponse(string json) =>
        new(HttpStatusCode.OK) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    // ── Not configured ───────────────────────────────────────────────────────

    [Test]
    public async Task NotConfigured_ApiKeyMissing_ReturnsNotProcessed()
    {
        var svc = CreateService(new AppSetting { GeminiApiUrl = "https://gemini.test/api" });

        var result = await svc.CheckCommentAsync("hello");

        Assert.That(result.WasProcessed, Is.False);
        Assert.That(result.IsFlagged,    Is.False);
    }

    [Test]
    public async Task NotConfigured_ApiUrlMissing_ReturnsNotProcessed()
    {
        var svc = CreateService(new AppSetting { GeminiApiKey = "test-key" });

        var result = await svc.CheckCommentAsync("hello");

        Assert.That(result.WasProcessed, Is.False);
        Assert.That(result.IsFlagged,    Is.False);
    }

    [Test]
    public async Task NotConfigured_DoesNotCallHttpClient()
    {
        var svc = CreateService(new AppSetting());

        await svc.CheckCommentAsync("hello");

        _factory.DidNotReceive().CreateClient(Arg.Any<string>());
    }

    // ── Successful moderation ────────────────────────────────────────────────

    [Test]
    public async Task CleanComment_ReturnsWasProcessedTrueNotFlagged()
    {
        SetupHttpClient(OkResponse(GeminiEnvelope(false, false, "Looks clean")));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("Great post!");

        Assert.That(result.WasProcessed, Is.True);
        Assert.That(result.IsSpam,       Is.False);
        Assert.That(result.IsToxic,      Is.False);
        Assert.That(result.IsFlagged,    Is.False);
    }

    [Test]
    public async Task SpamComment_ReturnsFlaggedWithIsSpam()
    {
        SetupHttpClient(OkResponse(GeminiEnvelope(true, false, "Spam detected")));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("Buy cheap meds now!");

        Assert.That(result.IsSpam,    Is.True);
        Assert.That(result.IsToxic,   Is.False);
        Assert.That(result.IsFlagged, Is.True);
    }

    [Test]
    public async Task ToxicComment_ReturnsFlaggedWithIsToxic()
    {
        SetupHttpClient(OkResponse(GeminiEnvelope(false, true, "Hate speech")));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("Some toxic content");

        Assert.That(result.IsSpam,    Is.False);
        Assert.That(result.IsToxic,   Is.True);
        Assert.That(result.IsFlagged, Is.True);
    }

    [Test]
    public async Task Response_ReasonIsPassedThrough()
    {
        SetupHttpClient(OkResponse(GeminiEnvelope(true, false, "Contains phishing link")));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("Click here!");

        Assert.That(result.Reason, Is.EqualTo("Contains phishing link"));
    }

    [Test]
    public async Task Response_WithTrailingTextAfterJson_StillParsesCorrectly()
    {
        // Gemini sometimes appends explanation text after the JSON object
        var inner = "{\"IsSpam\": true, \"IsToxic\": false, \"Reason\": \"Spam\"} Here is my explanation...";
        var json  = JsonSerializer.Serialize(new
        {
            candidates = new[]
            {
                new { content = new { parts = new[] { new { text = inner } } } }
            }
        });
        SetupHttpClient(OkResponse(json));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("Buy now!");

        Assert.That(result.IsSpam,       Is.True);
        Assert.That(result.WasProcessed, Is.True);
    }

    // ── Failure cases ────────────────────────────────────────────────────────

    [Test]
    public async Task NetworkError_ReturnsNotProcessed_DoesNotThrow()
    {
        SetupHttpClientError(new HttpRequestException("Connection refused"));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("hello");

        Assert.That(result.WasProcessed, Is.False);
        Assert.That(result.IsFlagged,    Is.False);
    }

    [Test]
    public async Task NonSuccessStatus_ReturnsNotProcessed_DoesNotThrow()
    {
        SetupHttpClient(new HttpResponseMessage(HttpStatusCode.InternalServerError));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("hello");

        Assert.That(result.WasProcessed, Is.False);
        Assert.That(result.IsFlagged,    Is.False);
    }

    [Test]
    public async Task MalformedGeminiSchema_ReturnsNotFlagged_DoesNotThrow()
    {
        // Valid JSON but missing the expected candidates/content/parts structure
        SetupHttpClient(OkResponse("{\"unexpected\": \"schema\"}"));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("hello");

        Assert.That(result.IsFlagged, Is.False);
    }

    [Test]
    public async Task NetworkFailure_ReasonContainsFallbackMessage()
    {
        SetupHttpClientError(new HttpRequestException("timeout"));
        var svc = CreateService(ConfiguredSetting);

        var result = await svc.CheckCommentAsync("hello");

        Assert.That(result.Reason, Is.Not.Null.And.Not.Empty);
    }
}
