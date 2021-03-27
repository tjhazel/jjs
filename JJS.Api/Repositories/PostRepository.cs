using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Article;
using JJS.Api.Models.Article.ViewModel;
using JJS.Api.Models.Configuration;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace JJS.Api.Repositories
{
   [ServiceImplementation(typeof(IPostRepository))]
   public class PostRepository : IPostRepository
   {
      private readonly AppConfig _appConfig;

      public PostRepository(AppConfig appConfig)
      {
         _appConfig = appConfig;
      }

      const string GET_BY_ID_SQL = "SELECT * FROM Posts WHERE PostId = @postId";

      public async Task<Post> Get(int id)
      {
         using (var db = new SqlConnection(_appConfig.DatabaseConnectionString))
         {

            await db.OpenAsync();
            var result = await db.QueryFirstAsync<Post>(GET_BY_ID_SQL, new { postId = id });
            return result;
         }
      }

      const string GET_PostCategorySummary_SQL = @"SELECT * FROM vw_cust_PostCategorySummary;";

      public async Task<IEnumerable<PostCategorySummary>> GetAll()
      {
         using (var db = new SqlConnection(_appConfig.DatabaseConnectionString))
         {
            await db.OpenAsync();
            return await db.QueryAsync<PostCategorySummary>(GET_PostCategorySummary_SQL);
         }
      }

      const string SEARCH_PostCategorySummary_SQL = @"SELECT * FROM vw_cust_PostCategorySummary WHERE CategoryId in @categoryIds;";

      public async Task<IEnumerable<PostCategorySummary>> Search(int[] categoryIds)
      {
         using (var db = new SqlConnection(_appConfig.DatabaseConnectionString))
         {
            await db.OpenAsync();
            return await db.QueryAsync<PostCategorySummary>(SEARCH_PostCategorySummary_SQL, new { categoryIds = categoryIds });
         }
      }
   }

   public interface IPostRepository
   {
      Task<Post> Get(int id);
      Task<IEnumerable<PostCategorySummary>> GetAll();
      Task<IEnumerable<PostCategorySummary>> Search(int[] categoryIds);
   }
}
