using System.Text;
using System.Text.Json;
using JJS.Api.Models;
using JJS.Api.Models.Comment;
using JJS.Api.Models.Configuration;

namespace JJS.Api.Services;

/// <summary>
/// this will use gemini https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent
/// 
/// here is a sample that will flag a comment.  
/// <![CDATA[
/// Contains the GTUBE (Generic Test for Unsolicited Bulk Email) standard string designed to trigger anti-spam filters.
/// ]]>
/// </summary>
/// <param name="httpClientFactory"></param>
/// <param name="appSetting"></param>
/// <param name="logger"></param>
[ServiceImplementation(typeof(ICommentModerationService))]
public class CommentModerationService(
   IHttpClientFactory httpClientFactory,
   AppSetting appSetting,
   ILogger<CommentModerationService> logger) : ICommentModerationService
{
   private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
   private readonly AppSetting _appSetting = appSetting;
   private readonly ILogger<CommentModerationService> _logger = logger;

   private static readonly JsonSerializerOptions _deserializeOptions = new() { PropertyNameCaseInsensitive = true };

   public async Task<ModerationResult> CheckCommentAsync(string commentText)
   {
      if (string.IsNullOrWhiteSpace(_appSetting.GeminiApiKey) || string.IsNullOrWhiteSpace(_appSetting.GeminiApiUrl))
      {
         _logger.LogWarning("Gemini moderation not configured — allowing comment through");
         return new ModerationResult();
      }

      var url = $"{_appSetting.GeminiApiUrl}?key={_appSetting.GeminiApiKey}";

      var payload = new
      {
         contents = new[]
         {
            new
            {
               parts = new[]
               {
                  new
                  {
                     text = $"Analyze this user comment for moderation: \"{commentText}\". " +
                            "Evaluate if it contains spam, scams, phishing links, or toxic/hateful speech. " +
                            "Respond ONLY with a JSON object matching this exact schema: " +
                            "{ \"IsSpam\": boolean, \"IsToxic\": boolean, \"Reason\": \"short explanation\" }"
                  }
               }
            }
         },
         generationConfig = new { responseMimeType = "application/json" }
      };

      var jsonPayload = JsonSerializer.Serialize(payload);
      var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
      bool wasProcessed = false;
      string responseString = null;
      string jsonText = null;
      try
      {
         var client = _httpClientFactory.CreateClient();
         var response = await client.PostAsync(url, content);
         response.EnsureSuccessStatusCode();

         responseString = await response.Content.ReadAsStringAsync();

         wasProcessed = true;
         jsonText = ParseAiText(responseString);

         var result = JsonSerializer.Deserialize<ModerationResult>(jsonText, _deserializeOptions) ?? new ModerationResult();
         result.WasProcessed = true;
         return result;
      }
      catch (Exception ex)
      {
         _logger.LogWarning(ex, "Gemini moderation check failed — allowing comment through");
         if (!string.IsNullOrWhiteSpace(responseString))
            _logger.LogWarning(responseString);
         return new ModerationResult { WasProcessed = wasProcessed };
      }
   }

   private string ParseAiText(string responseString)
   {
      using var doc = JsonDocument.Parse(responseString);
      var aiText = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

      // Gemini occasionally appends explanation text after the JSON object — extract just the object
      var start = aiText.IndexOf('{');
      var end = aiText.LastIndexOf('}');
      var jsonText = (start >= 0 && end > start) ? aiText[start..(end + 1)] : aiText;
      return jsonText;
   }
}

public interface ICommentModerationService
{
   Task<ModerationResult> CheckCommentAsync(string commentText);
}
