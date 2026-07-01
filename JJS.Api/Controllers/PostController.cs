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
   public async Task<IEnumerable<PostViewModel>> GetPublic()
   {
      var user = User.GetUserFromClaims();
      Console.WriteLine($"User: {user?.DisplayName}, {user?.Role}");
      return await _postService.GetPublic();
   }

   [HttpPatch, Route("[action]/{postId}")]
   public async Task View(int postId)
   {
      await _postService.View(postId);
   }

   [HttpGet, Route("[action]")]
   [Authorize(Roles = "Admin")]
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
      var user = User.GetUserFromClaims();
      return await _postService.Save(model, user);
   }
}
