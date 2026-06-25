using JJS.Api.Extensions;
using JJS.Api.Models.Post;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostController(IPostService postService) : Controller
{
   private readonly IPostService _postService = postService;

   [HttpGet]
   public async Task<IEnumerable<PostViewModel>> GetAll()
   {
      var user = User.GetUserFromClaims();
      Console.WriteLine($"User: {user?.DisplayName}, {user?.Role}");
      return await _postService.GetAll();
   }

   [HttpPost]
   [Authorize(Roles = "Admin")]
   public async Task<int> Save(Post model)
   {
      return await _postService.Save(model);
   }
}
