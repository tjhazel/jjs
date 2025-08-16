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
               string,
               Post>(GetAll_Posts,
               (post, cat) =>
               {
                  if (!string.IsNullOrWhiteSpace(cat))
                  {
                     post.Categories = cat.Split(',').Distinct().OrderBy(y => y).ToArray();
                  }
                  return post;
               },
               splitOn: "Categories");

      return result;
   }
}

public interface IPostRepository
{
   Task<IEnumerable<Post>> GetAll();
}
