namespace JJS.Api.Models.People;

public class ClaimsUser
{
   public string Email { get; set; }
   public string DisplayName { get; set; }
   public string Role { get; set; }
   public DateTime LastActivityDate { get; set; }
}