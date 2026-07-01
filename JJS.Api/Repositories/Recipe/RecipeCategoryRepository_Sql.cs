
namespace JJS.Api.Repositories.Recipe;

public partial class RecipeCategoryRepository
{
   const string GetAll_Sql = """
      select RecipeCategoryId, [Name]
        from RecipeCategories
      """;

   const string DELETE_BY_RECIPE_SQL = """
      DELETE FROM [RecipeCategory_xref] WHERE RecipeFk = @recipeId;
      """;

   const string INSERT_CATEGORY_SQL = """
      INSERT INTO [RecipeCategory_xref] (RecipeFk, RecipeCategoryFk) VALUES (@recipeId, @categoryId);
      """;
}
