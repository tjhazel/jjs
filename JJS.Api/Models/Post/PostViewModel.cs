using JJS.Api.Models.Recipe;

namespace JJS.Api.Models.Post;

public class PostViewModel : Post
{
   public required string CreatedBy { get; set; }
   public required string ModifiedBy { get; set; }
   public int[] CategoryIds { get; set; } = [];
   public string[] Categories { get; set; } = [];
   public string? ImageUrl { get; set; }
   public string? href { get; set; }

}
