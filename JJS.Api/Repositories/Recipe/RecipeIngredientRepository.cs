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
}

public interface IRecipeIngredientRepository
{
   Task<IEnumerable<IngredientViewModel>> GetRecipeIngredients(int recipeId);
}
