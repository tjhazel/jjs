using JJS.Api.Models.Article.ViewModel;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using JJS.Api.Extensions;

namespace JJS.Api.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class ArticleController : ControllerBase
   {
      private readonly ArticleService _articleService;

      public ArticleController(ArticleService articleService)
      {
         _articleService = articleService;
      }

      [HttpGet]
      [Route("[action]")]
      public async Task<IEnumerable<PostCategorySummary>> GetAll()
      {
         //var user = HttpContext.User.GetUserFromClaims();

         return await _articleService.GetAll();
      }

      [HttpGet]
      [Route("[action]")]
      [Authorize]
      public async Task<IEnumerable<PostCategorySummary>> GetAllSecure()
      {
         //var user = HttpContext.User.GetUserFromClaims();
         return await _articleService.GetAll();
      }


      [HttpPost]
      [Route("[action]")]
      public async Task<IEnumerable<PostCategorySummary>> Search(PostCategorySummarySearch request)
      {
         return await _articleService.Search(request);
      }
   }
}
