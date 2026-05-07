using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Post;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(ICategoryRepository))]
public partial class CategoryRepository(AppConfig appConfig) : ICategoryRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<Category>> Get(int categoryTypeId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryAsync<Category>(GetAll_Sql, new { categoryTypeId });

      return result;
   }
}

public interface ICategoryRepository
{
   Task<IEnumerable<Category>> Get(int categoryTypeId);
}
