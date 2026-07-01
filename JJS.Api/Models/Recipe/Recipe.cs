namespace JJS.Api.Models.Recipe;

public class Recipe
{
   public int RecipeId { get; set; }
   public required string Name { get; set; }
   public string? Description { get; set; }
   public required string RecipeSource { get; set; }
   public required string Course { get; set; }
   public required string DishType { get; set; }
   public int Calories { get; set; }
   public int Fat { get; set; }
   public int NumberServed { get; set; }
   public string? PrepTime { get; set; }
   public string? CookTime { get; set; }
   public decimal? EstimatedCost { get; set; }
   public int? PictureFk { get; set; }
   public required bool IsViewableByPublic { get; set; }
   public int ViewCount { get; set; }
   public DateTime? CreatedDate { get; set; }
   public Guid? CreatedByFk { get; set; }
   public DateTime? ModifiedDate { get; set; }
   public Guid? ModifiedByFk { get; set; }
}
