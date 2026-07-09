using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Configuration;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(IUserRepository))]
public partial class UserRepository(AppConfig appConfig) : IUserRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<User> Get(Guid id)
   {
      using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryFirstAsync<User>(GET_BY_ID_SQL, new { id });
      return result;
   }

   public async Task<User?> Get(string email)
   {
      using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryFirstOrDefaultAsync<User?>(GET_BY_EMAIL_SQL, new { email });
      return result;
   }

   public async Task Merge(User user)
   {
      using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(MERGE_USER_SQL, user);
   }

   public async Task BlockUser(string email, string blockedBy, string reason)
   {
      using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(BLOCK_USER_SQL, new { email, blockedBy, reason });
   }

   public async Task UnblockUser(string email)
   {
      using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(UNBLOCK_USER_SQL, new { email });
   }

   public async Task<IEnumerable<UserSummary>> GetAll()
   {
      using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<UserSummary>(GET_ALL_WITH_STATS_SQL);
   }
}

public interface IUserRepository
{
   Task<User> Get(Guid id);
   Task<User> Get(string email);
   Task Merge(User user);
   Task BlockUser(string email, string blockedBy, string reason);
   Task<IEnumerable<UserSummary>> GetAll();
   Task UnblockUser(string email);
}
