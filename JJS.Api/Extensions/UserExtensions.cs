using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using JJS.Api.Models.User;

namespace JJS.Api.Extensions
{
   public static class UserExtensions
   {
      public static IEnumerable<Claim> GeClaimsFromUser(this User user)
      {
         var claims = new List<Claim>
         {
        //    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.AuthTime, user.LastActivityDate.ToUtcString()),
         };

         return claims;
      }

      public static string GetEmailFromClaims(this IPrincipal user)
      {
         var claimsUser = user as ClaimsPrincipal;

         if (claimsUser == null)
         {
            return null;
         }

         var email = claimsUser.GetClaimValue(JwtRegisteredClaimNames.Email);

         return email;
      }

      public static string GetNameFromClaims(this IPrincipal user)
      {
         var claimsUser = user as ClaimsPrincipal;

         if (claimsUser == null)
         {
            return null;
         }

         var name = claimsUser.GetClaimValue(ClaimTypes.Name);

         return name;
      }

      public static ClaimsUser GetUserFromClaims(this IPrincipal user)
      {
         var claimsUser = user as ClaimsPrincipal;

         if (claimsUser == null)
         {
            return null;
         }

         var email = claimsUser.GetClaimValue(JwtRegisteredClaimNames.Email);
         var lastActivity = claimsUser.GetClaimValue(JwtRegisteredClaimNames.AuthTime);

         var appUser = new ClaimsUser
         {
            Email = claimsUser.GetClaimValue(ClaimTypes.Email),
            DisplayName = claimsUser.GetClaimValue(ClaimTypes.Name),
            Role = claimsUser.GetClaimValue(ClaimTypes.Role),
            LastActivityDate = lastActivity == null ? DateTime.Now : DateTime.Parse(lastActivity),
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
