
namespace JJS.Api.Models.Recipe;

public class RecipeViewModel : Recipe
{
   public string? CreatedBy { get; set; }
   public string? ModifiedBy { get; set; }
   public int[] RecipeCategoryIds { get; set; } = [];
   public string[] RecipeCategories { get; set; } = [];
}
