using JJS.Api.Extensions;
using JJS.Api.Services;
using System.Data;
using System.Security.Claims;
using System.Text;

namespace JJS.Api.Middleware;

public class UserValidationMiddleware(RequestDelegate next)
{
   private readonly RequestDelegate _next = next;

   public async Task Invoke(HttpContext httpContext,
       IUserService userService)
   {
      // Completely skip authorization logic for CORS preflight requests
      if (HttpMethods.IsOptions(httpContext.Request.Method))
      {
         await _next(httpContext);
         return;
      }

      //string token = null;
      //if (!string.IsNullOrWhiteSpace(httpContext.Request.Headers[HeaderNames.Authorization]))
      //{
      //   token = httpContext.Request.Headers[HeaderNames.Authorization].ToString().Replace("Bearer ", "");
      //}

      var claimsUser = httpContext.User.GetUserFromClaims();

      if (httpContext.User.Identity.IsAuthenticated && claimsUser != null && !string.IsNullOrWhiteSpace(claimsUser.Email))
      {
         //Want to validate logged in user maps to a record in the database - if not try to add user to system
         //If unable to add user or user is disabled then return 403 to client
         var user = await userService.Get(claimsUser.Email);


         var invalidUser = false;
         if (user == null)
         {
            var name = httpContext.User.GetNameFromClaims();

            user = new Models.People.User
            {
               Id = Guid.NewGuid(),
               Email = claimsUser.Email,
               DisplayName = claimsUser.DisplayName ?? claimsUser.Email,
               IsDisabled = false,
               LastActivityDate = DateTime.UtcNow,
               Role = claimsUser.Role ?? "Guest"
            };
            await userService.Merge(user);
         }
         else if (user.IsDisabled)
         {
            invalidUser = true;
         }

         if (invalidUser)
         {
            httpContext.Response.StatusCode = 403;
            await httpContext.Response.WriteAsync(string.Empty, Encoding.UTF8);

            //This stops pipeline processing
            return;
         }

         //update user role so we can access User in the stack and use Authorize(Role
         var appClaims = httpContext.User.Claims.ToList();
         appClaims.Add(new Claim(ClaimTypes.Role, user.Role));
         string authType = httpContext.User.Identity?.AuthenticationType ?? "CustomTokenAuth";
         var appIdentity = new ClaimsIdentity(appClaims, authType);
         httpContext.User = new ClaimsPrincipal(appIdentity);
      }

      await _next(httpContext);
   }
}

public static class UserValidationMiddlewareExtensions
{
   public static IApplicationBuilder UseUserValidationMiddleware(this IApplicationBuilder builder)
   {
      return builder.UseMiddleware<UserValidationMiddleware>();
   }
}