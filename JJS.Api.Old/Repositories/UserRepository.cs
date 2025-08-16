using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.User;
using JJS.Api.Models.Configuration;
using System;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace JJS.Api.Repositories
{
   [ServiceImplementation(typeof(IUserRepository))]
   public class UserRepository : IUserRepository
   {
      private readonly AppConfig _appConfig;

      public UserRepository(AppConfig appConfig)
      {
         _appConfig = appConfig;
      }

      const string GET_BY_ID_SQL = "SELECT * FROM Users WHERE Id = @id";

      public async Task<User> Get(Guid id)
      {
         using (var db = new SqlConnection(_appConfig.DatabaseConnectionString))
         {

            await db.OpenAsync();
            var result = await db.QueryFirstAsync<User>(GET_BY_ID_SQL, new { id});
            return result;
         }
      }

      const string GET_BY_EMAIL_SQL = "SELECT * FROM Users WHERE Email = @email";

      public async Task<User> Get(string email)
      {
         using (var db = new SqlConnection(_appConfig.DatabaseConnectionString))
         {

            await db.OpenAsync();
            var result = await db.QueryFirstAsync<User>(GET_BY_EMAIL_SQL, new { email });
            return result;
         }
      }

//declare @id uniqueidentifier = newid(), @email nvarchar(256) = 'joker@email.com', @displayName nvarchar(256) = 'Joker', 
//@role nvarchar(50) = 'joker', @lastActivityDate datetime = getutcdate(), @isDisabled bit = 0;

      const string MERGE_USER_SQL = @"
MERGE INTO Users AS Target
USING(Values
   (@id, @email, @displayName, @role, @lastActivityDate, @isDisabled)
) AS Source(Id, [Email], [DisplayName], [Role], [IsDisabled], [LastActivityDate] )
ON(Target.Id = Source.Id)
WHEN MATCHED THEN
   UPDATE
   SET Target.[Email] = Source.[Email]
      , Target.[DisplayName] = Source.[DisplayName]
      , Target.[Role] = Source.[Role]
      , Target.[IsDisabled] = Source.[IsDisabled]
      , Target.[LastActivityDate] = Source.[LastActivityDate]
WHEN NOT MATCHED THEN
   INSERT (Id, [Email], [DisplayName], [Role], [IsDisabled], [LastActivityDate])
   VALUES (Source.Id, Source.[Email], Source.[DisplayName], Source.[Role], Source.[IsDisabled], Source.[LastActivityDate])
;";

      public async Task Merge(User user)
      {
         using (var db = new SqlConnection(_appConfig.DatabaseConnectionString))
         {
            await db.OpenAsync();
            var result = await db.QueryFirstAsync<User>(MERGE_USER_SQL, 
               new { 
                  user.Id,
                  user.Email,
                  user.DisplayName,
                  user.Role,
                  user.IsDisabled,
                  user.LastActivityDate,
               });
         }
      }
   }

   public interface IUserRepository
   {
      Task<User> Get(Guid id);
      Task<User> Get(string email);
      Task Merge(User user);
   }
}
