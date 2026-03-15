namespace JJS.Api.Models.Post;

public class Post
{
   public int PostId { get; set; }
   public required string Title { get; set; }
   public required string PreviewText { get; set; }
   public required string Body { get; set; }
   public DateTime ReleaseDate { get; set; }
   public DateTime ExpireDate { get; set; }
   public required bool CommentsEnabled { get; set; }
   public required bool Approved { get; set; }
   public long ViewCount { get; set; }
   public DateTime CreatedDate { get; set; }
   public required Guid CreatedByFk { get; set; }
   public DateTime ModifiedDate { get; set; }
   public required Guid ModifiedByFk { get; set; }
}
