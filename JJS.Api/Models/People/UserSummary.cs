namespace JJS.Api.Models.People;

public class UserSummary : User
{
   public int CommentCount { get; set; }
   public DateTime? LastCommentDate { get; set; }
   public int? LastCommentId { get; set; }
   public int? LastCommentPostId { get; set; }
   public string? LastCommentPostTitle { get; set; }
}
