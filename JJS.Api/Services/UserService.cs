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
      if (user.Id is null) user.Id = Guid.NewGuid();
      await _userRepository.Merge(user);
   }

   public async Task BlockUser(string email, string currentUserEmail, string blockedBy, string reason)
   {
      if (email.Equals(currentUserEmail, StringComparison.OrdinalIgnoreCase))
         throw new InvalidOperationException("Unable to block self.");

      var target = await _userRepository.Get(email);
      if (target?.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true)
         throw new InvalidOperationException("Admin users must be manually blocked.");

      if (target?.Blocked != true)
      {
         await _userRepository.BlockUser(email, blockedBy, reason);
         await _cacheService.Clear(GetCacheKey(email));
      }
   }

   public async Task<IEnumerable<UserSummary>> GetAll()
   {
      return await _userRepository.GetAll();
   }

   public async Task UnblockUser(string email)
   {
      await _userRepository.UnblockUser(email);
      await _cacheService.Clear(GetCacheKey(email));
   }

   public async Task SetRole(string email, string role)
   {
      await _userRepository.SetRole(email, role);
      await _cacheService.Clear(GetCacheKey(email));
   }
}


public interface IUserService
{
   Task<User> Get(Guid id);
   Task<User> Get(string email);
   Task Merge(User user);
   Task BlockUser(string email, string currentUserEmail, string blockedBy, string reason);
   Task<IEnumerable<UserSummary>> GetAll();
   Task UnblockUser(string email);
   Task SetRole(string email, string role);
}