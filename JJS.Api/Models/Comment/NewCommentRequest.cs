namespace JJS.Api.Models.Comment;

public class NewCommentRequest
{
   public required string Title { get; set; }
   public required string EntryText { get; set; }
}
