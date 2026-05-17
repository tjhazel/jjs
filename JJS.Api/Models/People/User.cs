namespace JJS.Api.Models.People;

public class User
{
   public Guid Id { get; set; }
   public string Email { get; set; }
   public string DisplayName { get; set; }
   public string Role { get; set; }
   public DateTime LastActivityDate { get; set; }
   public bool IsDisabled { get; set; }
}
