using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories.Recipe;

[ServiceImplementation(typeof(IRecipeInstructionRepository))]
public partial class RecipeInstructionRepository(AppConfig appConfig) : IRecipeInstructionRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<InstructionViewModel>> GetRecipeInstructions(int recipeId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<InstructionViewModel>(GetRecipeInstructions_Sql, new { recipeId }) ?? [];
   }

   public async Task SaveInstructions(int recipeId, IEnumerable<InstructionViewModel> instructions)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();

      var savedIds = new List<int>();
      foreach (var instruction in instructions)
      {
         var id = await db.ExecuteScalarAsync<int>(MERGE_SQL, new
         {
            instruction.RecipeInstructionId,
            RecipeFk = recipeId,
            instruction.Name,
            instruction.Instruction,
            instruction.Sequence
         });
         savedIds.Add(id);
      }

      await db.ExecuteAsync(DELETE_BY_RECIPE_SQL, new { recipeId, keepIds = savedIds.DefaultIfEmpty(-1) });
   }
}

public interface IRecipeInstructionRepository
{
   Task<IEnumerable<InstructionViewModel>> GetRecipeInstructions(int recipeId);
   Task SaveInstructions(int recipeId, IEnumerable<InstructionViewModel> instructions);
}
