using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories.Recipe;

[ServiceImplementation(typeof(IRecipeInstructionRepository))]
public partial class RecipeInstructionRepository(AppConfig _appConfig) : IRecipeInstructionRepository
{
   public async Task<IEnumerable<InstructionViewModel>> GetRecipeInstructions(int recipeId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<InstructionViewModel>(GetRecipeInstructions_Sql, new { recipeId }) ?? [];
   }
}

public interface IRecipeInstructionRepository
{
   Task<IEnumerable<InstructionViewModel>> GetRecipeInstructions(int recipeId);
}
