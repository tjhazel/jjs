namespace JJS.Api.Models.Comment;

public class Comment
{
   public int CommentId { get; set; }
   public int PostFk { get; set; }
   public required string Title { get; set; }
   public required string EntryText { get; set; }
   public required string AuthorName { get; set; }
   public DateTime CreatedDate { get; set; }
}
