using JJS.Api.Models.Comment;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentController(ICommentService commentService) : Controller
{
   private readonly ICommentService _commentService = commentService;

   [HttpGet, Route("[action]/{postId}")]
   public async Task<IEnumerable<Comment>> GetByPost(int postId)
   {
      return await _commentService.GetByPost(postId);
   }
}
