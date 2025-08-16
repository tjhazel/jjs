using JJS.Api.Models;
using JJS.Api.Models.Article;
using JJS.Api.Models.Article.ViewModel;
using JJS.Api.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Transactions;
using System.Linq;

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
         return await _postRepository.GetPostCategorySummaries();
      }

      public async Task<IEnumerable<PostCategorySummary>> Search(PostCategorySummarySearch search)
      {
         return await _postRepository.Search(search.Categories);
      }

      public async Task<Post> Save(Post post)
      {
         using (var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
         {
            int postId = await _postRepository.Save(post);
            if (post.PostId != null)
            {
               var catArr = post.Categories != null ? post.Categories.Select(y => y.CategoryId).ToArray() : new int[0];
               await _postRepository.DeleteCategories(post.PostId.Value, catArr);
            }

            if (post.Categories != null)
            {
               foreach (var category in post.Categories)
               {
                  var rowsAffected = await _postRepository.SaveCategory(postId, category.CategoryId);
               }
            }
            var result = await _postRepository.Get(postId);
            transaction.Complete();
            return result.First();
         }
      }
   }
}
