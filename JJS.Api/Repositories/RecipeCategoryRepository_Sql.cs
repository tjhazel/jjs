
namespace JJS.Api.Repositories;

public partial class RecipeCategoryRepository
{
   const string GetAll_Sql = """
      select RecipeCategoryId, [Name]
        from RecipeCategories
      """;
}
