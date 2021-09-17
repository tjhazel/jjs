using Google.Apis.Auth;
using JJS.Api.Models.Configuration;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using JJS.Api.Extensions;
using JJS.Api.Models.User;

namespace JJS.Api.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class AuthController : ControllerBase
   {
      private readonly UserService _userService;
      private readonly AppSetting _appSetting;
      private readonly IHttpContextAccessor _httpContext;

      public AuthController(UserService userService, AppSetting appSetting, IHttpContextAccessor httpContext)
      {
         _userService = userService;
         _appSetting = appSetting;
         _httpContext = httpContext;
      }

      //[AllowAnonymous]
      //[Route("[action]")]
      //public async Task<IActionResult> GetToken([FromBody] string tokenId)
      //{
      //   try
      //   {
      //      var authTime = DateTime.UtcNow;
      //      var payload = GoogleJsonWebSignature.ValidateAsync(tokenId, new GoogleJsonWebSignature.ValidationSettings()).Result;

      //      var user = await _userService.Get(payload.Email);
      //      user.LastActivityDate = authTime;

      //      var claims = user.GeClaimsFromUser();

      //      await _userService.Merge(user);

      //      var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appSetting.JwtSecret));
      //      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      //      var token = new JwtSecurityToken(_appSetting.JwtIssuer,
      //        user.Role,
      //        claims,
      //        expires: DateTime.Now.AddDays(1),
      //        signingCredentials: creds);

      //      return Ok(new
      //      {
      //         token = new JwtSecurityTokenHandler().WriteToken(token)
      //      });
      //   }
      //   catch (Exception ex)
      //   {
      //      BadRequest(ex.Message);
      //   }
      //   return BadRequest();
      //}

      [HttpGet]
      [Route("[action]")]
      public async Task<User> GetCurrentUser()
      {
         var email = _httpContext.HttpContext.User.GetEmailFromClaims();
         return await _userService.Get(email);
      }
   }
}
