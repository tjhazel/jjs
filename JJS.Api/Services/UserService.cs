using JJS.Api.Models;
using JJS.Api.Models.User;
using JJS.Api.Repositories;
using System;
using System.Threading.Tasks;
using Google.Apis.Auth;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using JJS.Api.Models.Configuration;
using System.Security.Principal;

namespace JJS.Api.Services
{
   [ServiceImplementation(typeof(UserService))]
   public class UserService
   {
      private readonly IUserRepository _userRepository;
      private readonly AppSetting _appSetting;

      public UserService(IUserRepository userRepository, AppSetting appSetting)
      {
         _userRepository = userRepository;
         _appSetting = appSetting;
      }

      public async Task<User> Get(Guid id)
      {
         return await _userRepository.Get(id);
      }

      public async Task<User> Get(string email)
      {
         return await _userRepository.Get(email);
      }

      public async Task Merge(User user)
      {
         await _userRepository.Merge(user);
      }
   }
}
