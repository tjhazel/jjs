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
   public partial class PostRepository : IPostRepository
   {
      private readonly AppConfig _appConfig;

      public PostRepository(AppConfig appConfig)
      {
         _appConfig = appConfig;
      }

      public async Task<IEnumerable<Post>> Get(int? id = null)
      {
         await using var db = new SqlConnection(_appConfig.DatabaseConnectionString);
         await db.OpenAsync();
         return await db.QueryAsync<Post>(GET_BY_ID_SQL, new { postId = id });
      }

      public async Task<IEnumerable<PostCategorySummary>> GetPostCategorySummaries(int? id = null)
      {
         await using var db = new SqlConnection(_appConfig.DatabaseConnectionString);
         await db.OpenAsync();
         return await db.QueryAsync<PostCategorySummary>(GET_PostCategorySummary_SQL, new { id = id });
      }

      public async Task<IEnumerable<PostCategorySummary>> Search(int[] categoryIds)
      {
         await using var db = new SqlConnection(_appConfig.DatabaseConnectionString);
         await db.OpenAsync();
         return await db.QueryAsync<PostCategorySummary>(SEARCH_PostCategorySummary_SQL, new { categoryIds = categoryIds });
      }

      public async Task<int> Save(Post post)
      {
         await using var db = new SqlConnection(_appConfig.DatabaseConnectionString);
         await db.OpenAsync();
         return await db.ExecuteScalarAsync<int>(MERGE_SQL, post);
      }

      public async Task DeleteCategories(int postId, IEnumerable<int> exceptCategoryIds)
      {
         await using var db = new SqlConnection(_appConfig.DatabaseConnectionString);
         await db.OpenAsync();
         await db.ExecuteAsync(DELETE_POSTCATEGORIES_SQL, new
         {
            postFk = postId,
            categoryFks = exceptCategoryIds
         });
      }

      public async Task<int> SaveCategory(int postId, int categoryId)
      {
         await using var db = new SqlConnection(_appConfig.DatabaseConnectionString);
         await db.OpenAsync();
         return await db.ExecuteScalarAsync<int>(MERGE_POSTCATEGORIES_SQL, new
         {
            postFk = postId,
            categoryFk = categoryId
         });
      }
   }

   public interface IPostRepository
   {
      Task<IEnumerable<Post>> Get(int? id = null);
      Task<IEnumerable<PostCategorySummary>> GetPostCategorySummaries(int? id = null);
      Task<IEnumerable<PostCategorySummary>> Search(int[] categoryIds);
      Task<int> Save(Post post);
      Task DeleteCategories(int postId, IEnumerable<int> exceptCategoryIds);
      Task<int> SaveCategory(int postId, int categoryId);
   }
}
