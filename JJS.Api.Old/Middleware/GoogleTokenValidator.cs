using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;


namespace JJS.Api.Middleware
{
   /// <summary>
   /// https://stackoverflow.com/questions/48727900/google-jwt-authentication-with-aspnet-core-2-0
   /// </summary>
   public class GoogleTokenValidator : ISecurityTokenValidator
   {
      private readonly JwtSecurityTokenHandler _tokenHandler;

      public GoogleTokenValidator()
      {
         _tokenHandler = new JwtSecurityTokenHandler();
      }

      public bool CanValidateToken => true;

      public int MaximumTokenSizeInBytes { get; set; } = TokenValidationParameters.DefaultMaximumTokenSizeInBytes;

      public bool CanReadToken(string securityToken)
      {
         bool canRead = _tokenHandler.CanReadToken(securityToken);
         return canRead;
      }

      public ClaimsPrincipal ValidateToken(string securityToken, TokenValidationParameters validationParameters, out SecurityToken validatedToken)
      {
         validatedToken = null;
         var payload = GoogleJsonWebSignature.ValidateAsync(
            securityToken,
            new GoogleJsonWebSignature.ValidationSettings()
            ).Result; // here is where I delegate to Google to validate

         var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, payload.Name),
                    new Claim(ClaimTypes.Name, payload.Name),
                    new Claim(ClaimTypes.Role, "dummy"),
                    new Claim(JwtRegisteredClaimNames.FamilyName, payload.FamilyName),
                    new Claim(JwtRegisteredClaimNames.GivenName, payload.GivenName),
                    new Claim(JwtRegisteredClaimNames.Email, payload.Email),
                    new Claim(JwtRegisteredClaimNames.Sub, payload.Subject),
                    new Claim(JwtRegisteredClaimNames.Iss, payload.Issuer),
                };

         try
         {
            var principle = new ClaimsPrincipal();
            principle.AddIdentity(new ClaimsIdentity(claims, JwtBearerDefaults.AuthenticationScheme));
           //principle.AddIdentity(new ClaimsIdentity(claims, AuthenticationTypes.Password));
            return principle;
         }
         catch (Exception e)
         {
            Console.WriteLine(e);
            throw;

         }
      }
   }
}
