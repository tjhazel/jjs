using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Recipe;
using JJS.Api.Repositories;
using JJS.Api.Services.Cache;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IUserService))]
public class UserService(
      ICacheService cacheService, 
      IUserRepository userRepository, 
      AppSetting appSetting) : IUserService
{
   private readonly ICacheService _cacheService = cacheService;
   private readonly IUserRepository _userRepository = userRepository;
   private readonly AppSetting _appSetting = appSetting;

   string GetCacheKey(string email) => $"user/{email}";

   public async Task<User> Get(Guid id)
   {
      return await _userRepository.Get(id);
   }

   public async Task<User> Get(string email)
   {
      return await _cacheService.GetCachedValue(_userRepository.Get, email, GetCacheKey(email));
   }

   public async Task Merge(User user)
   {
      await _cacheService.Clear(GetCacheKey(user.Email));
      await _userRepository.Merge(user);
   }
}


public interface IUserService
{
   Task<User> Get(Guid id);
   Task<User> Get(string email);
   Task Merge(User user);
}