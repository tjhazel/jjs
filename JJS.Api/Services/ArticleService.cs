using JJS.Api.Models;
using JJS.Api.Models.Article.ViewModel;
using JJS.Api.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JJS.Api.Services
{
   [ServiceImplementation(typeof(ArticleService))]
   public class ArticleService
   {
      private readonly IPostRepository _postRepository;

      public ArticleService(IPostRepository postRepository)
      {
         _postRepository = postRepository;
      }

      public async Task<IEnumerable<PostCategorySummary>> GetAll()
      {
         return await _postRepository.GetAll();
      }

      public async Task<IEnumerable<PostCategorySummary>> Search(PostCategorySummarySearch search)
      {
         return await _postRepository.Search(search.Categories);
      }

   }
}
