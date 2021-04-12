using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using JJS.Api.Models.User;

namespace JJS.Api.Services
{
   public static class UserExtensions
   {
      public static Guid ObjectId(this IPrincipal user)
      {
         var claimsUser = user as ClaimsPrincipal;
         var userOid = GetClaimValue(claimsUser, "http://schemas.microsoft.com/identity/claims/objectidentifier");

         var debugUser = Debugger.IsAttached && user.Identity.IsAuthenticated == false;
         if (string.IsNullOrEmpty(userOid) || debugUser)
         {
            return Guid.Empty;
         }

         return new Guid(userOid);
      }

      public static Guid? GetTenantFromClaims(this IPrincipal user)
      {
         var claimsUser = user as ClaimsPrincipal;

         if (claimsUser == null)
         {
            return null;
         }

         return Guid.Parse(claimsUser.GetClaimValue("http://schemas.microsoft.com/identity/claims/tenantid"));
      }

      public static User GetUserFromClaims(this IPrincipal user)
      {
         var claimsUser = user as ClaimsPrincipal;

         if (claimsUser == null)
         {
            return null;
         }

         var appUser = new User
         {
            Id = Guid.Empty,
            Email = claimsUser.GetClaimValue(JwtRegisteredClaimNames.Email),
            DisplayName = claimsUser.GetClaimValue(JwtRegisteredClaimNames.Name),
            //Role = claimsUser.GetClaimValue(JwtRegisteredClaimNames.ro),
            LastActivityDate = DateTime.UtcNow
         };

         return appUser;
      }

      private static string GetClaimValue(this ClaimsPrincipal claimUser, string typeName)
      {
         return claimUser?
             .Claims
             .SingleOrDefault(c => c.Type == typeName)?
             .Value;
      }
   }
}
