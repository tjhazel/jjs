using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using JJS.Api.Models.Article;

namespace JJS.Api.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class CategoryController : ControllerBase
   {
      private readonly CategoryService _categoryService;

      public CategoryController(CategoryService categoryService)
      {
         _categoryService = categoryService;
      }

      [HttpGet]
      public async Task<IEnumerable<Category>> Get()
      {
         return await _categoryService.Get();
      }
   }
}
