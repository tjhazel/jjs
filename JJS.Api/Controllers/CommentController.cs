using JJS.Api.Extensions;
using JJS.Api.Models;
using JJS.Api.Models.Comment;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentController(ICommentService commentService, IHttpContextAccessor httpContextAccessor) : Controller
{
   private readonly ICommentService _commentService = commentService;
   private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

   [HttpGet, Route("[action]/{postId}")]
   public async Task<PagedResult<Comment>> GetByPost(int postId, [FromQuery] int page = 1)
   {
      return await _commentService.GetByPost(postId, page);
   }

   [HttpPost, Route("[action]/{postId}")]
   [Authorize]
   public async Task AddForPost(int postId, NewCommentRequest request)
   {
      var user = User.GetUserFromClaims();
      var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
      await _commentService.Add(postId, request, user, ip);
   }
}
