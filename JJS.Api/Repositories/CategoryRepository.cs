using Dapper;
using JJS.Api.Models;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(ICategoryRepository))]
public partial class CategoryRepository(AppConfig _appConfig) : ICategoryRepository
{
   public async Task<IEnumerable<Category>> GetAll()
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryAsync<Category>(GetAll_Sql);

      return result;
   }
}

public interface ICategoryRepository
{
   Task<IEnumerable<Category>> GetAll();
}
