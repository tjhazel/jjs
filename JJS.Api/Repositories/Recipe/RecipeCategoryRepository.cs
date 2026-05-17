using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories.Recipe;

[ServiceImplementation(typeof(IRecipeCategoryRepository))]
public partial class RecipeCategoryRepository(AppConfig appConfig) : IRecipeCategoryRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<RecipeCategory>> GetAll()
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<RecipeCategory>(GetAll_Sql);
   }
}

public interface IRecipeCategoryRepository
{
   Task<IEnumerable<RecipeCategory>> GetAll();
}
