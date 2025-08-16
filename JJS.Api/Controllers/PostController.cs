using JJS.Api.Models;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class PostController(PostService _postService) : Controller
{
   [HttpGet]
   public async Task<IEnumerable<Post>> GetAll()
   {
      return await _postService.GetAll();
   }
}
