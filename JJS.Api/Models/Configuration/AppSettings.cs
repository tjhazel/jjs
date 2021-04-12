
namespace JJS.Api.Models.Configuration
{
    public class AppSetting
    {
        public string JwtSecret {get; set;}
        public string GoogleClientId  {get; set;}
        public string GoogleClientSecret  {get; set;}
        public string JwtEmailEncryption {get; set;}
    }
}