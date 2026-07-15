namespace JJS.Api.Models.Comment;

public class NewCommentRequest
{
   public string? Title { get; set; }
   public required string EntryText { get; set; }
   public int? ParentCommentFk { get; set; }
}
