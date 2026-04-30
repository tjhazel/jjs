
namespace JJS.Api.Models.Recipe;

public class RecipeDetailViewModel : RecipeViewModel
{
   public IEnumerable<IngredientViewModel> Ingredients { get; set; } = [];
   public IEnumerable<InstructionViewModel> Instructions { get; set; } = [];
   public AttachmentViewModel? Picture { get; set; }
}
