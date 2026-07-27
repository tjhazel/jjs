using JJS.Api.Models;
using JJS.Api.Models.Comment;
using JJS.Api.Repositories;
using JJS.Api.Services;
using JJS.Api.Tests.Fakes;
using NSubstitute;

namespace JJS.Api.Tests.Services;

[TestFixture]
public class CommentServiceTest
{
    private ICommentRepository _commentRepo = null!;
    private ICommentModerationService _moderation = null!;
    private FakeCacheService _cache = null!;

    [SetUp]
    public void SetUp()
    {
        _commentRepo = Substitute.For<ICommentRepository>();
        _moderation  = Substitute.For<ICommentModerationService>();
        _cache       = new FakeCacheService();

        _moderation.CheckCommentAsync(Arg.Any<string>()).Returns(new ModerationResult());
        _commentRepo.Add(Arg.Any<CommentInput>()).Returns(Task.CompletedTask);
    }

    private CommentService CreateService() => new(_commentRepo, _cache, _moderation);

    private static Models.People.ClaimsUser User(string email = "user@test.com", string name = "Test User") =>
        new() { Email = email, DisplayName = name };

    private static NewCommentRequest Request(string text = "Hello!", string? title = null, int? parentId = null) =>
        new() { EntryText = text, Title = title, ParentCommentFk = parentId };

    private static Comment MakeComment(int id) =>
        new() { CommentId = id, EntryText = "x", AuthorName = "A", ReactionCounts = "" };

    // ── Add — CommentInput assembly ──────────────────────────────────────────

    [Test]
    public async Task Add_SetsExpectedFieldsOnCommentInput()
    {
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(42, Request("Nice post!", "My title"), User("u@t.com", "Alice"), "192.168.1.1");

        Assert.That(captured,              Is.Not.Null);
        Assert.That(captured!.PostFk,      Is.EqualTo(42));
        Assert.That(captured.EntryText,    Is.EqualTo("Nice post!"));
        Assert.That(captured.Title,        Is.EqualTo("My title"));
        Assert.That(captured.AuthorEmail,  Is.EqualTo("u@t.com"));
        Assert.That(captured.AuthorName,   Is.EqualTo("Alice"));
    }

    [Test]
    public async Task Add_TruncatesAuthorIpTo15Chars()
    {
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), "192.168.100.200.extra");

        Assert.That(captured!.AuthorIp, Is.EqualTo("192.168.100.200"));
    }

    [Test]
    public async Task Add_ShortIp_IsNotTruncated()
    {
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), "10.0.0.1");

        Assert.That(captured!.AuthorIp, Is.EqualTo("10.0.0.1"));
    }

    [Test]
    public async Task Add_NullIp_LeavesAuthorIpNull()
    {
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.AuthorIp, Is.Null);
    }

    // ── Add — moderation results ─────────────────────────────────────────────

    [Test]
    public async Task Add_ModerationNotProcessed_ScreenedByIsNullAndAdminHiddenIsFalse()
    {
        _moderation.CheckCommentAsync(Arg.Any<string>()).Returns(new ModerationResult { WasProcessed = false });
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.ScreenedBy, Is.Null);
        Assert.That(captured.AdminHidden, Is.False);
    }

    [Test]
    public async Task Add_ModerationProcessed_SetsScreenedByToGeminiAI()
    {
        _moderation.CheckCommentAsync(Arg.Any<string>()).Returns(new ModerationResult { WasProcessed = true });
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.ScreenedBy, Is.EqualTo("Gemini AI"));
    }

    [Test]
    public async Task Add_FlaggedAsSpam_SetsAdminHiddenTrue()
    {
        _moderation.CheckCommentAsync(Arg.Any<string>())
            .Returns(new ModerationResult { WasProcessed = true, IsSpam = true });
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.AdminHidden, Is.True);
    }

    [Test]
    public async Task Add_FlaggedAsToxic_SetsAdminHiddenTrue()
    {
        _moderation.CheckCommentAsync(Arg.Any<string>())
            .Returns(new ModerationResult { WasProcessed = true, IsToxic = true });
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.AdminHidden, Is.True);
    }

    [Test]
    public async Task Add_NotFlagged_AdminHiddenIsFalse()
    {
        _moderation.CheckCommentAsync(Arg.Any<string>())
            .Returns(new ModerationResult { WasProcessed = true, IsSpam = false, IsToxic = false });
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.AdminHidden, Is.False);
    }

    [Test]
    public async Task Add_ModerationHasReason_SetsScreenResult()
    {
        _moderation.CheckCommentAsync(Arg.Any<string>())
            .Returns(new ModerationResult { WasProcessed = true, Reason = "Looks like spam" });
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.ScreenResult, Is.EqualTo("Looks like spam"));
    }

    [Test]
    public async Task Add_ModerationReasonIsEmpty_DoesNotSetScreenResult()
    {
        _moderation.CheckCommentAsync(Arg.Any<string>())
            .Returns(new ModerationResult { WasProcessed = true, Reason = "" });
        var svc = CreateService();
        CommentInput? captured = null;
        _commentRepo.Add(Arg.Do<CommentInput>(x => captured = x)).Returns(Task.CompletedTask);

        await svc.Add(1, Request(), User(), null);

        Assert.That(captured!.ScreenResult, Is.Null);
    }

    [Test]
    public async Task Add_PassesCombinedTitleAndTextToModerationService()
    {
        var svc = CreateService();

        await svc.Add(1, Request("Entry text", "My title"), User(), null);

        await _moderation.Received(1).CheckCommentAsync("My title Entry text");
    }

    [Test]
    public async Task Add_NullTitle_PassesOnlyEntryTextToModerationService()
    {
        var svc = CreateService();

        await svc.Add(1, Request("Just the text", title: null), User(), null);

        await _moderation.Received(1).CheckCommentAsync("Just the text");
    }

    // ── Add — cache invalidation ─────────────────────────────────────────────

    [Test]
    public async Task Add_WithParentComment_ClearsReplyCacheForParent()
    {
        var svc = CreateService();
        _cache.Seed("comment/replies/5/public", new List<Comment>());

        await svc.Add(1, Request(parentId: 5), User(), null);

        Assert.That(_cache.Contains("comment/replies/5/public"), Is.False);
    }

    [Test]
    public async Task Add_WithoutParentComment_ClearsPostCommentCache()
    {
        var svc = CreateService();
        _cache.Seed("comment/bypost/1/1/public", new List<Comment>());

        await svc.Add(1, Request(parentId: null), User(), null);

        Assert.That(_cache.Contains("comment/bypost/1/1/public"), Is.False);
    }

    [Test]
    public async Task Add_WithParentComment_DoesNotClearPostCommentCache()
    {
        var svc = CreateService();
        _cache.Seed("comment/bypost/1/1/public", new List<Comment>());

        await svc.Add(1, Request(parentId: 5), User(), null);

        Assert.That(_cache.Contains("comment/bypost/1/1/public"), Is.True);
    }

    // ── GetByPost — paging ───────────────────────────────────────────────────

    [Test]
    public async Task GetByPost_FewerThanPageSize_HasMoreIsFalse()
    {
        var svc = CreateService();
        _commentRepo.GetByPost(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<bool>())
            .Returns(Task.FromResult<IEnumerable<Comment>>(Enumerable.Range(1, 5).Select(MakeComment).ToList()));

        var result = await svc.GetByPost(postId: 1, page: 1, isAdmin: false);

        Assert.That(result.HasMore,            Is.False);
        Assert.That(result.Items.Count(),      Is.EqualTo(5));
    }

    [Test]
    public async Task GetByPost_MoreThanPageSize_HasMoreIsTrueAndItemsAreCappedAt10()
    {
        var svc = CreateService();
        // Repository is asked for PageSize+1=11; returning 11 signals there is a next page
        _commentRepo.GetByPost(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<bool>())
            .Returns(Task.FromResult<IEnumerable<Comment>>(Enumerable.Range(1, 11).Select(MakeComment).ToList()));

        var result = await svc.GetByPost(postId: 1, page: 1, isAdmin: false);

        Assert.That(result.HasMore,          Is.True);
        Assert.That(result.Items.Count(),    Is.EqualTo(10));
    }

    [Test]
    public async Task GetByPost_CacheHit_DoesNotCallRepository()
    {
        var svc    = CreateService();
        var cached = new PagedResult<Comment> { Items = [], HasMore = false };
        _cache.Seed("comment/bypost/7/2/public", cached);

        var result = await svc.GetByPost(postId: 7, page: 2, isAdmin: false);

        Assert.That(result, Is.SameAs(cached));
        await _commentRepo.DidNotReceive().GetByPost(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<bool>());
    }

    [Test]
    public async Task GetByPost_AdminAndPublicRequestsUseSeparateCacheKeys()
    {
        var svc        = CreateService();
        var adminCached = new PagedResult<Comment> { Items = [], HasMore = false };
        _cache.Seed("comment/bypost/1/1/admin", adminCached);
        _commentRepo.GetByPost(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<bool>())
            .Returns(Task.FromResult<IEnumerable<Comment>>([]));

        var publicResult = await svc.GetByPost(postId: 1, page: 1, isAdmin: false); // miss → hits repo
        var adminResult  = await svc.GetByPost(postId: 1, page: 1, isAdmin: true);  // hit → skips repo

        Assert.That(adminResult, Is.SameAs(adminCached));
        await _commentRepo.Received(1).GetByPost(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<int>(), false);
    }

    [Test]
    public async Task GetByPost_Page2_UsesCorrectOffset()
    {
        var svc = CreateService();
        _commentRepo.GetByPost(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<int>(), Arg.Any<bool>())
            .Returns(Task.FromResult<IEnumerable<Comment>>([]));

        await svc.GetByPost(postId: 1, page: 2, isAdmin: false);

        // page 2 offset = (2-1) * 10 = 10
        await _commentRepo.Received(1).GetByPost(1, 10, Arg.Any<int>(), Arg.Any<bool>());
    }

    // ── GetReplies ───────────────────────────────────────────────────────────

    [Test]
    public async Task GetReplies_CacheHit_DoesNotCallRepository()
    {
        var svc    = CreateService();
        var cached = new List<Comment> { MakeComment(1) } as IEnumerable<Comment>;
        _cache.Seed("comment/replies/3/public", cached);

        var result = await svc.GetReplies(commentId: 3, isAdmin: false);

        Assert.That(result, Is.SameAs(cached));
        await _commentRepo.DidNotReceive().GetReplies(Arg.Any<int>(), Arg.Any<bool>());
    }

    [Test]
    public async Task GetReplies_CacheMiss_CallsRepositoryAndCachesResult()
    {
        var svc     = CreateService();
        var replies = new List<Comment> { MakeComment(1) } as IEnumerable<Comment>;
        _commentRepo.GetReplies(3, false).Returns(Task.FromResult(replies));

        await svc.GetReplies(commentId: 3, isAdmin: false);
        await svc.GetReplies(commentId: 3, isAdmin: false); // second call

        await _commentRepo.Received(1).GetReplies(3, false);
    }

    // ── Hide / Unhide ────────────────────────────────────────────────────────

    [Test]
    public async Task Hide_DelegatesArgsToRepository()
    {
        var svc = CreateService();

        await svc.Hide(99, "Admin", "Spam");

        await _commentRepo.Received(1).Hide(99, "Admin", "Spam");
    }

    [Test]
    public async Task Hide_ClearsEntireCache()
    {
        var svc = CreateService();
        _cache.Seed("comment/bypost/1/1/public", new object());

        await svc.Hide(1, "Admin", null);

        Assert.That(_cache.Contains("comment/bypost/1/1/public"), Is.False);
    }

    [Test]
    public async Task Unhide_DelegatesCommentIdToRepository()
    {
        var svc = CreateService();

        await svc.Unhide(55);

        await _commentRepo.Received(1).Unhide(55);
    }

    [Test]
    public async Task Unhide_ClearsEntireCache()
    {
        var svc = CreateService();
        _cache.Seed("comment/bypost/1/1/public", new object());

        await svc.Unhide(1);

        Assert.That(_cache.Contains("comment/bypost/1/1/public"), Is.False);
    }
}
