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
   [ServiceImplementation(typeof(ICategoryRepository))]
   public partial class CategoryRepository : ICategoryRepository
   {
      private readonly AppConfig _appConfig;

      public CategoryRepository(AppConfig appConfig)
      {
         _appConfig = appConfig;
      }

      public async Task<IEnumerable<Category>> Get()
      {
         await using var db = new SqlConnection(_appConfig.DatabaseConnectionString);
         await db.OpenAsync();
         return await db.QueryAsync<Category>(GET_SQL);
      }
   }

   public interface ICategoryRepository
   {
      Task<IEnumerable<Category>> Get();
   }
}
