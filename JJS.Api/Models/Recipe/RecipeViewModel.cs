
namespace JJS.Api.Models.Recipe;

public class RecipeViewModel : Recipe
{
   public required string CreatedBy { get; set; }
   public required string ModifiedBy { get; set; }
   public int[] RecipeCategoryIds { get; set; } = [];
   public string[] RecipeCategories { get; set; } = [];
}
