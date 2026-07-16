
namespace JJS.Api.Repositories.Recipe;

public partial class RecipeCategoryRepository
{
   const string GetAll_Sql = """
      select RecipeCategoryId, [Name]
        from RecipeCategories
      """;

   const string MERGE_CATEGORIES_SQL = """
      MERGE [RecipeCategory_xref] AS TARGET
      USING (
          SELECT CAST(value AS int) AS RecipeCategoryFk
          FROM STRING_SPLIT(@categoryIds, ',')
          WHERE value <> ''
      ) AS SOURCE
      ON TARGET.RecipeFk = @recipeId AND TARGET.RecipeCategoryFk = SOURCE.RecipeCategoryFk
      WHEN NOT MATCHED BY TARGET THEN
          INSERT (RecipeFk, RecipeCategoryFk) VALUES (@recipeId, SOURCE.RecipeCategoryFk)
      WHEN NOT MATCHED BY SOURCE AND TARGET.RecipeFk = @recipeId THEN
          DELETE;
      """;
}
