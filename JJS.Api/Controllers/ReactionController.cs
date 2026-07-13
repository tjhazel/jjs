using JJS.Api.Extensions;
using JJS.Api.Models.Reaction;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReactionController(IReactionService reactionService) : Controller
{
    private static readonly HashSet<string> AllowedEmojis = ["❤️", "👍", "😂", "😮", "😢", "🎉"];

    private readonly IReactionService _reactionService = reactionService;

    [HttpGet, Route("[action]/{postId}")]
    public async Task<ReactionSummary> GetByPost(int postId)
    {
        var email = User.Identity?.IsAuthenticated == true ? User.GetEmailFromClaims() : null;
        return await _reactionService.GetByPost(postId, email);
    }

    [HttpPost, Route("[action]/{postId}")]
    [Authorize]
    public async Task<IActionResult> Toggle(int postId, [FromBody] PostReactionInput input)
    {
        if (!AllowedEmojis.Contains(input.Emoji))
            return BadRequest("Invalid emoji.");

        var email = User.GetEmailFromClaims();
        await _reactionService.Toggle(postId, email, input.Emoji);
        return Ok();
    }
}
