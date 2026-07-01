using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories.Recipe;

[ServiceImplementation(typeof(IRecipeIngredientRepository))]
public partial class RecipeIngredientRepository(AppConfig appConfig) : IRecipeIngredientRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<IngredientViewModel>> GetRecipeIngredients(int recipeId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<IngredientViewModel>(GetRecipeIngredients_Sql, new { recipeId }) ?? [];
   }

   public async Task SaveIngredients(int recipeId, IEnumerable<IngredientViewModel> ingredients)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();

      var savedIds = new List<int>();
      foreach (var ingredient in ingredients)
      {
         var id = await db.ExecuteScalarAsync<int>(MERGE_SQL, new
         {
            ingredient.IngredientsXrefId,
            RecipeFk = recipeId,
            ingredient.IngredientFk,
            ingredient.Amount,
            ingredient.UnitOfMeasureFk,
            ingredient.Description,
            ingredient.Sequence
         });
         savedIds.Add(id);
      }

      await db.ExecuteAsync(DELETE_BY_RECIPE_SQL, new { recipeId, keepIds = savedIds.DefaultIfEmpty(-1) });
   }
}

public interface IRecipeIngredientRepository
{
   Task<IEnumerable<IngredientViewModel>> GetRecipeIngredients(int recipeId);
   Task SaveIngredients(int recipeId, IEnumerable<IngredientViewModel> ingredients);
}
