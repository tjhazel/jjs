using System;
using System.Text;
using System.Threading.Tasks;
using JJS.Api.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using JJS.Api.Extensions;

namespace JJS.Api.Middleware
{
   public class UserValidationMiddleware
   {
      private readonly RequestDelegate _next;

      public UserValidationMiddleware(RequestDelegate next)
      {
         _next = next;
      }

      public async Task Invoke(HttpContext httpContext,
          UserService userService)
      {
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

               user = new Models.User.User
               {
                  Id = Guid.NewGuid(),
                  Email = claimsUser.Email,
                  DisplayName = claimsUser.DisplayName ?? claimsUser.Email,
                  IsDisabled = false,
                  LastActivityDate = claimsUser.LastActivityDate,
                  Role = claimsUser.Role ?? "guest"
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
    
}