using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Comment;
using JJS.Api.Models.Configuration;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(ICommentRepository))]
public partial class CommentRepository(AppConfig appConfig) : ICommentRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<Comment>> GetByPost(int postId, int offset, int pageSize)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<Comment>(GetByPost_Sql, new { postId, offset, pageSize });
   }

   public async Task Add(CommentInput input)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(Add_Sql, input);
   }
}

public interface ICommentRepository
{
   Task<IEnumerable<Comment>> GetByPost(int postId, int offset, int pageSize);
   Task Add(CommentInput input);
}
