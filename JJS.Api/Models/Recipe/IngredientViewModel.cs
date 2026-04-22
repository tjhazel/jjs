namespace JJS.Api.Models.Recipe;

public class IngredientViewModel
{
   public int IngredientsXrefId { get; set; }
   public int IngredientFk { get; set; }
   public required string Amount { get; set; }
   public required string UnitOfMeasure { get; set; }
   public required string Ingredient { get; set; }
   public string? Description { get; set; }
   public int Sequence { get; set; }
}
