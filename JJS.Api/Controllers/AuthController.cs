using JJS.Api.Extensions;
using JJS.Api.Models.People;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IUserService userService, IHttpContextAccessor httpContext) : Controller
{
   private readonly IUserService _userService = userService;
   private readonly IHttpContextAccessor _httpContext = httpContext;

   [Authorize]
   [HttpGet]
   [Route("[action]")]
   public async Task<User> GetCurrentUser()
   {
      var email = _httpContext.HttpContext.User.GetEmailFromClaims();
      return await _userService.Get(email);
   }
}
