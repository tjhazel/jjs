namespace JJS.Api.Models;

public class Post
{
   public int PostId { get; set; }
   public required string Title { get; set; }
   public required string PreviewText { get; set; }
   public required string Body { get; set; }
   public DateTime CreatedDate { get; set; }
   public required string CreatedBy { get; set; }
   public long ViewCount { get; set; }
   public string[] Categories { get; set; } = [];

   public required string ImageUrl { get; set; }

}
