using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(IRecipeRepository))]
public partial class RecipeRepository(AppConfig _appConfig) : IRecipeRepository
{
   public async Task<IEnumerable<RecipeViewModel>> GetAll()
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryAsync<RecipeViewModel,
              string, string,
              RecipeViewModel>(GetAll_Sql,
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
              splitOn: "RecipeCategoryIds,RecipeCategories");

      return result;
   }
}

public interface IRecipeRepository
{
   Task<IEnumerable<RecipeViewModel>> GetAll();
}
