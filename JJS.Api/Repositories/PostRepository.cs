using Dapper;
using JJS.Api.Models;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(IPostRepository))]
public partial class PostRepository(AppConfig _appConfig) : IPostRepository
{
   public async Task<IEnumerable<Post>> GetAll()
   {
      await using var db = new SqlConnection(_appConfig.DbConnectionString);
      await db.OpenAsync();
      var result = await db.QueryAsync<Post,
               string, string,
               Post>(GetAll_Sql,
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
}

public interface IPostRepository
{
   Task<IEnumerable<Post>> GetAll();
}
