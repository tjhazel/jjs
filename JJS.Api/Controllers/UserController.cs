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

   [HttpGet, Route("[action]")]
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> GetAll()
   {
      var users = await _userService.GetAll();
      return Ok(users);
   }

   [HttpPatch, Route("[action]")]
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> UnblockUser([FromBody] UnblockUserRequest request)
   {
      await _userService.UnblockUser(request.Email);
      return Ok();
   }

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

   [HttpPatch, Route("[action]")]
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> SetRole([FromBody] SetRoleRequest request)
   {
      if (request.Role is not "CircleOfTrust" and not "Guest")
         return BadRequest(new { message = "Invalid role. Must be CircleOfTrust or Guest." });

      await _userService.SetRole(request.Email, request.Role);
      return Ok();
   }
}

public record BlockUserRequest(string Email, string Reason);
public record UnblockUserRequest(string Email);
public record SetRoleRequest(string Email, string Role);
