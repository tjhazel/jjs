using Google.Apis.Auth;
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

namespace JJS.Api.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class AuthController : ControllerBase
   {
      private readonly UserService _userService;

      public AuthController(UserService userService)
      {
         _userService = userService;
      }

      [AllowAnonymous]
      [HttpGet("Current")]
      public async Task<IActionResult> GetCurrentUser([FromBody] string tokenId)
      {
         try
         {
            var user = User.GetUserFromClaims();

            //var user = await _userService.GetUserByExternalObjectId(externalObjectId);
            //var user = _userService.Get();
            //var token = await _userService.GetJwtToken(tokenId);
            //return Ok(new
            //{
            //   token = new JwtSecurityTokenHandler().WriteToken(token)
            //});
         }
         catch (Exception ex)
         {
            BadRequest(ex.Message);
         }
         return BadRequest();
      }
   }
}
