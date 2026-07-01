
namespace JJS.Api.Repositories.Recipe;

public partial class RecipeIngredientRepository
{
   const string GetRecipeIngredients_Sql = """
      select
         x.IngredientsXrefId
         ,x.IngredientFk
         ,x.Amount
         ,x.UnitOfMeasureFk
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

   const string MERGE_SQL = """
      MERGE [Ingredients_xref] AS TARGET
      USING (
         VALUES (@IngredientsXrefId
            ,@RecipeFk
            ,@IngredientFk
            ,@Amount
            ,@UnitOfMeasureFk
            ,@Description
            ,@Sequence)
      ) AS SOURCE (IngredientsXrefId
            ,RecipeFk
            ,IngredientFk
            ,Amount
            ,UnitOfMeasureFk
            ,[Description]
            ,Sequence)
      ON SOURCE.IngredientsXrefId = TARGET.IngredientsXrefId
      WHEN MATCHED THEN
         UPDATE SET
             RecipeFk        = SOURCE.RecipeFk
            ,IngredientFk    = SOURCE.IngredientFk
            ,Amount          = SOURCE.Amount
            ,UnitOfMeasureFk = SOURCE.UnitOfMeasureFk
            ,[Description]   = SOURCE.[Description]
            ,Sequence        = SOURCE.Sequence
      WHEN NOT MATCHED BY TARGET THEN
         INSERT (RecipeFk
            ,IngredientFk
            ,Amount
            ,UnitOfMeasureFk
            ,[Description]
            ,Sequence)
         VALUES (SOURCE.RecipeFk
            ,SOURCE.IngredientFk
            ,SOURCE.Amount
            ,SOURCE.UnitOfMeasureFk
            ,SOURCE.[Description]
            ,SOURCE.Sequence)
      OUTPUT inserted.IngredientsXrefId
      ;
      """;

   const string DELETE_BY_RECIPE_SQL = """
      DELETE FROM [Ingredients_xref] WHERE RecipeFk = @recipeId AND IngredientsXrefId NOT IN @keepIds;
      """;
}
