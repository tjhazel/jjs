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

   public async Task<IEnumerable<Comment>> GetByPost(int postId, int offset, int pageSize, bool isAdmin)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      return await db.QueryAsync<Comment>(GetByPost_Sql, new { postId, offset, pageSize, isAdmin });
   }

   public async Task Add(CommentInput input)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(Add_Sql, input);
   }

   public async Task Hide(int commentId, string hiddenBy)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(Hide_Sql, new { commentId, hiddenBy });
   }

   public async Task Unhide(int commentId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(Unhide_Sql, new { commentId });
   }
}

public interface ICommentRepository
{
   Task<IEnumerable<Comment>> GetByPost(int postId, int offset, int pageSize, bool isAdmin);
   Task Add(CommentInput input);
   Task Hide(int commentId, string hiddenBy);
   Task Unhide(int commentId);
}
