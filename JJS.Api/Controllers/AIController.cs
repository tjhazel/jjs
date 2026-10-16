using JJS.Api.Models.Comment;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AIController(
   ICommentModerationService commentModerationService,
   ILogger<AIController> logger) : ControllerBase
{
   [HttpPost("test-moderation")]
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> TestModeration([FromBody] TestCommentModerationRequest request)
   {
      if (string.IsNullOrWhiteSpace(request.CommentText))
         return BadRequest(new { message = "Comment text is required." });

      try
      {
         var result = await commentModerationService.CheckCommentAsync(request.CommentText);
         return Ok(result);
      }
      catch (Exception ex)
      {
         logger.LogError(ex, "Comment moderation test failed.");
         return StatusCode(StatusCodes.Status500InternalServerError, new
         {
            message = $"Comment moderation test failed: {ex.Message}"
         });
      }
   }
}

public record TestCommentModerationRequest(string CommentText);
