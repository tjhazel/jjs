namespace JJS.Api.Models.Comment;

public class CommentInput
{
   public int PostFk { get; set; }
   public string? Title { get; set; }
   public required string EntryText { get; set; }
   public required string AuthorName { get; set; }
   public required string AuthorEmail { get; set; }
   public string? AuthorIp { get; set; }
   public int? ParentCommentFk { get; set; }
   public bool AdminHidden { get; set; }
   public string? ScreenedBy { get; set; }
   public string? ScreenResult { get; set; }
}
