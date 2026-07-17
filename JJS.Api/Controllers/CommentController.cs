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
      return await _commentService.GetByPost(postId, page, User.IsInRole("Admin"));
   }

   [HttpGet, Route("[action]/{commentId}")]
   public async Task<IEnumerable<Comment>> GetReplies(int commentId)
   {
      return await _commentService.GetReplies(commentId, User.IsInRole("Admin"));
   }

   [HttpPost, Route("[action]/{postId}")]
   [Authorize]
   public async Task AddForPost(int postId, NewCommentRequest request)
   {
      var user = User.GetUserFromClaims();
      var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
      await _commentService.Add(postId, request, user, ip);
   }

   [HttpPatch, Route("[action]/{commentId}")]
   [Authorize(Roles = "Admin")]
   public async Task HideComment(int commentId, [FromBody] HideCommentRequest? request = null)
   {
      var user = User.GetUserFromClaims();
      await _commentService.Hide(commentId, user.DisplayName, request?.HiddenReason);
   }

   [HttpPatch, Route("[action]/{commentId}")]
   [Authorize(Roles = "Admin")]
   public async Task UnhideComment(int commentId)
   {
      await _commentService.Unhide(commentId);
   }

   [HttpGet, Route("[action]")]
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> GetAll([FromQuery] string? email, [FromQuery] int? postId)
   {
      var comments = await _commentService.GetAll(email, postId);
      return Ok(comments);
   }
}
