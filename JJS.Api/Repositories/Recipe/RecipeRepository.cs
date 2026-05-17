using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories.Recipe;

[ServiceImplementation(typeof(IRecipeRepository))]
public partial class RecipeRepository(AppConfig appConfig) : IRecipeRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<RecipeViewModel>> GetRecipes()
   {
      return await GetRecipeViewModel<RecipeViewModel>();
   }

   public async Task<RecipeDetailViewModel> GetRecipe(int recipeId)
   {
      var results = await GetRecipeViewModel<RecipeDetailViewModel>();
      return results.First();
   }

   private async Task<IEnumerable<T>> GetRecipeViewModel<T>(int? recipeId = null) where T : RecipeViewModel
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryAsync<T,
              string, string,
              T>(GetRecipeViewModel_Sql,
              (rec, catids, cats) =>
              {
                 if (!string.IsNullOrWhiteSpace(catids))
                 {
                    rec.RecipeCategoryIds = catids.Split(',')?.Distinct()?.Select(Int32.Parse)?.ToArray() ?? [];
                 }
                 if (!string.IsNullOrWhiteSpace(cats))
                 {
                    rec.RecipeCategories = cats.Split(',')?.Distinct()?.ToArray() ?? [];
                 }
                 return rec;
              },
              new { recipeId },
              splitOn: "RecipeCategoryIds,RecipeCategories");

      return result;
   }

}

public interface IRecipeRepository
{
   Task<IEnumerable<RecipeViewModel>> GetRecipes();
   Task<RecipeDetailViewModel> GetRecipe(int recipeId);
}
