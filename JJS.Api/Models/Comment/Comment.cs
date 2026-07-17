namespace JJS.Api.Models.Comment;

public class Comment
{
   public int CommentId { get; set; }
   public int PostFk { get; set; }
   public string? Title { get; set; }
   public required string EntryText { get; set; }
   public required string AuthorName { get; set; }
   public DateTime CreatedDate { get; set; }
   public bool AdminHidden { get; set; }
   public string? ScreenedBy { get; set; }
   public DateTime? HiddenDate { get; set; }
   public string? ScreenResult { get; set; }
   public string? AuthorEmail { get; set; }
   public bool? AuthorBlocked { get; set; }
   public int? ParentCommentFk { get; set; }
   public int ReplyCount { get; set; }
   public string ReactionCounts { get; set; } = "";
}
