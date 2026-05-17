using JJS.Api.Models.Post;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class CategoryController(ICategoryService categoryService) : Controller
{
   private readonly ICategoryService _categoryService = categoryService;

   [HttpGet]
   public async Task<IEnumerable<Category>> GetCategories(int categoryTypeId = 1)
   {
      return await _categoryService.Get(categoryTypeId);
   }
}
