using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.CrossCountry;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(ICrossCountryRepository))]
public partial class CrossCountryRepository(AppConfig appConfig) : ICrossCountryRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<CrossCountry>> GetAll()
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<CrossCountry>(GetAll_Sql);
   }

   public async Task<CrossCountry?> Get(int crossCountryId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QuerySingleOrDefaultAsync<CrossCountry>(Get_Sql, new { crossCountryId });
   }

   public async Task<int> Save(CrossCountry model)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.ExecuteScalarAsync<int>(Save_Sql, model);
   }
}

public interface ICrossCountryRepository
{
   Task<IEnumerable<CrossCountry>> GetAll();
   Task<CrossCountry?> Get(int crossCountryId);
   Task<int> Save(CrossCountry model);
}
