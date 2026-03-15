using JJS.Api.Models.Post;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class PostController(IPostService postService) : Controller
{
   private readonly IPostService _postService = postService;

   [HttpGet]
   public async Task<IEnumerable<PostViewModel>> GetAll()
   {
      return await _postService.GetAll();
   }
}
