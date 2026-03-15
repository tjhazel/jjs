namespace JJS.Api.Models;

public class Category
{
   public int CategoryId { get; set; }
   public required string Title { get; set; }
   public string? Description { get; set; }
   public string? ImageUrl { get; set; }
   public int CategoryTypeId { get; set; }
   public required string CategoryType { get; set; }
}
