using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Post;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(IPostRepository))]
public partial class PostRepository(AppConfig appConfig) : IPostRepository
{
   private readonly AppConfig _appConfig = appConfig;

   public async Task<IEnumerable<PostViewModel>> GetAll(bool isPublic)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryAsync<PostViewModel,
               string, string,
               PostViewModel>(GetAll_Sql,
               (post, catids, cats) =>
               {
                  if (!string.IsNullOrWhiteSpace(catids))
                  {
                     post.CategoryIds = catids.Split(',')?.Distinct()?.Select(Int32.Parse)?.ToArray() ?? [];
                  }
                  if (!string.IsNullOrWhiteSpace(cats))
                  {
                     post.Categories = cats.Split(',')?.Distinct()?.ToArray() ?? [];
                  }
                  return post;
               },
               param: new { isPublic },
               splitOn: "CategoryIds,Categories");

      return result;
   }

   public async Task View(int postId)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await db.ExecuteAsync(View_Sql, new { postId });
   }

   public async Task<int> Save(Post model)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      await using var tx = await db.BeginTransactionAsync();

      model.PostId = await db.ExecuteScalarAsync<int>(MERGE_SQL, model, tx);

      await db.ExecuteAsync(MergeCategories_Sql, new
      {
         postId = model.PostId,
         categoryIds = string.Join(',', model.CategoryIds)
      }, tx);

      await tx.CommitAsync();
      return model.PostId.Value;
   }
}

public interface IPostRepository
{
   Task<IEnumerable<PostViewModel>> GetAll(bool isPublic);
   Task View(int postId);
   Task<int> Save(Post model);
}
