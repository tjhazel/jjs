namespace JJS.Api.Models.Comment;

public class CommentInput
{
   public int PostFk { get; set; }
   public required string Title { get; set; }
   public required string EntryText { get; set; }
   public required string AuthorName { get; set; }
   public required string AuthorEmail { get; set; }
   public string? AuthorIp { get; set; }
}
