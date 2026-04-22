
namespace JJS.Api.Repositories.Recipe;

public partial class RecipeIngredientRepository
{
   const string GetRecipeIngredients_Sql = """
      select
         x.IngredientsXrefId
         ,x.IngredientFk
         ,x.Amount
         ,case 
            when (isnumeric(x.Amount) = 1 and try_cast(x.Amount as decimal(18, 2)) > 1)
               or (trim(x.Amount) like '% %' and trim(x.Amount) like '%/%')
            then uom.PluralName else uom.Name end 'UnitOfMeasure'
         ,i.Name 'Ingredient'
         ,x.Description
         ,x.Sequence
      From Ingredients_xref x
      join Ingredients i on i.IngredientId = x.IngredientFk
      left join UnitOfMeasure uom on uom.UnitOfMeasureId = x.UnitOfMeasureFk
      where x.RecipeFk = @recipeId
         order by x.Sequence
      """;
}
