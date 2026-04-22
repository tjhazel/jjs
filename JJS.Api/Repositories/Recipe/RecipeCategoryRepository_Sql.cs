
namespace JJS.Api.Repositories.Recipe;

public partial class RecipeCategoryRepository
{
   const string GetAll_Sql = """
      select RecipeCategoryId, [Name]
        from RecipeCategories
      """;
}
