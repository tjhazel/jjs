using System;
using System.Text;
using System.Threading.Tasks;
using JJS.Api.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

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
         var userPrincipal = httpContext.User.GetUserFromClaims();

         if (httpContext.User.Identity.IsAuthenticated && userPrincipal != null)
         {
            //Want to validate logged in user maps to a record in the database - if not try to add user to system
            //If unable to add user or user is disabled then return 403 to client
            var user = await userService.Get(userPrincipal.Email);
            var invalidUser = false;
            if (user == null)
            {
               user = new Models.User.User
               {
                  Id = Guid.NewGuid(),
                  Email = userPrincipal.Email,
                  DisplayName = userPrincipal.DisplayName ?? userPrincipal.Email,
                  IsDisabled = false,
                  LastActivityDate = DateTime.UtcNow,
                  Role = "guest"
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