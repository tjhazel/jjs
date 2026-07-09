using JJS.Api.Extensions;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserService userService) : Controller
{
   private readonly IUserService _userService = userService;

   [HttpPatch, Route("[action]")]
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> BlockUser([FromBody] BlockUserRequest request)
   {
      var admin = User.GetUserFromClaims();
      try
      {
         await _userService.BlockUser(request.Email, admin.Email, admin.DisplayName, request.Reason);
         return Ok();
      }
      catch (InvalidOperationException e)
      {
         return BadRequest(new { message = e.Message });
      }
   }
}

public record BlockUserRequest(string Email, string Reason);
