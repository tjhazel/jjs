using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(IAttachmentRepository))]
public partial class AttachmentRepository(AppConfig appConfig) : IAttachmentRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<Attachment> Get(int attachmentId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryFirstAsync<Attachment>(Get_Sql, new { attachmentId });
   }

   public async Task<Attachment?> GetByName(string name)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryFirstOrDefaultAsync<Attachment>(GetByName_Sql, new { name });
   }

   public async Task<int> Save(Attachment attachment)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QuerySingleAsync<int>(Save_Sql, attachment);
   }

   public async Task Upsert(Attachment attachment)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(Upsert_Sql, attachment);
   }
}

public interface IAttachmentRepository
{
   Task<Attachment> Get(int attachmentId);
   Task<Attachment?> GetByName(string name);
   Task<int> Save(Attachment attachment);
   Task Upsert(Attachment attachment);
}
