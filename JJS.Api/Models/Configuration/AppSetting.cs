namespace JJS.Api.Models.Configuration;

public class AppSetting
{
   public string JwtIssuer { get; set; }
   public string JwtSecret { get; set; }
   public string GoogleClientId { get; set; }
   public string GoogleClientSecret { get; set; }
   public string JwtEmailEncryption { get; set; }
   public string? GeminiApiUrl { get; set; }
   public string? GeminiApiKey { get; set; }
}