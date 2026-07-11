using JJS.Api.Models.People;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;

namespace JJS.Api.Extensions;

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
            new Claim(JwtRegisteredClaimNames.AuthTime, user.LastActivityDate.ToUniversalTime().ToString("o")),
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

     // var email = claimsUser.GetClaimValue(JwtRegisteredClaimNames.Email);
      //ClaimTypes.Email
      var email = claimsUser.GetClaimValue(ClaimTypes.Email);

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

      var lastActivity = claimsUser.GetClaimValue(JwtRegisteredClaimNames.AuthTime);

      var appUser = new ClaimsUser
      {
         Email = claimsUser.GetClaimValue(ClaimTypes.Email),
         DisplayName = claimsUser.GetClaimValue(ClaimTypes.Name) ??
                           claimsUser.GetClaimValue("name"),
         Role = claimsUser.GetClaimValue(ClaimTypes.Role),
         LastActivityDate = lastActivity == null ? DateTime.UtcNow : DateTime.Parse(lastActivity),
      };

      return appUser;
   }

   public static bool UserIsInCircleOfTrust(this IPrincipal user)
   {
      return user.IsInRole(UserRoles.Admin) || user.IsInRole(UserRoles.KnownUser);
   }

   private static string? GetClaimValue(this ClaimsPrincipal claimUser, string typeName)
   {
      return claimUser?
          .Claims
          .SingleOrDefault(c => c.Type == typeName)?
          .Value;
   }
}
