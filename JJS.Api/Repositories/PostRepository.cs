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

   public async Task<IEnumerable<PostViewModel>> GetAll()
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
               splitOn: "CategoryIds,Categories");

      return result;
   }

   public async Task<int> Save(Post model)
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      model.PostId = await db.ExecuteScalarAsync<int>(MERGE_SQL, model);
      return model.PostId;
   }
}

public interface IPostRepository
{
   Task<IEnumerable<PostViewModel>> GetAll();
   Task<int> Save(Post model);
}
