using Dapper;
using JJS.Api.Models;
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
      var result = await db.QueryFirstAsync<Attachment>(Get_Sql, new { attachmentId });

      return result;
   }
}

public interface IAttachmentRepository
{
   Task<Attachment> Get(int attachmentId);
}
