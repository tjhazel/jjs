using JJS.Api.Models;
using System.Runtime.Caching;

namespace JJS.Api.Services.Cache;

[ServiceImplementation(typeof(ICacheService))]
public class MemoryCacheService : ICacheService
{
   private static readonly Lazy<MemoryCache> _cache = new Lazy<MemoryCache>(() => new MemoryCache("JJSCache"));

   public Task<bool> TryGetValue<T>(string key, out T value) where T : class
   {
      value = _cache.Value.Get(key) as T;
      return Task.FromResult(value != null);
   }

   public async Task<T> GetCachedValue<T>(Func<Task<T>> dataAccessMethod, string cacheKey) where T : class
   {
      if (await TryGetValue(cacheKey, out T cachedResult))
      {
         return cachedResult;
      }

      var response = await dataAccessMethod();
      if (response != null)
      {
         await Set(cacheKey, response);
      }

      return response;
   }

   public async Task<U> GetCachedValue<T, U>(Func<T, Task<U>> dataAccessMethod, T parameter, string cacheKey) where U : class
   {
      if (await TryGetValue(cacheKey, out U cachedResult))
      {
         return cachedResult;
      }

      var response = await dataAccessMethod(parameter);
      if (response != null)
      {
         await Set(cacheKey, response);
      }

      return response;
   }

   public Task Set(string key, object value)
   {
      var cacheItem = new CacheItem(key, value);
      var policy = new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(20) };
      _cache.Value.Set(cacheItem, policy);

      return Task.CompletedTask;
   }

   public Task Set(string key, DateTime absoluteExpiration, object value)
   {
      var cacheItem = new CacheItem(key, value);
      var policy = new CacheItemPolicy { AbsoluteExpiration = absoluteExpiration };
      _cache.Value.Set(cacheItem, policy);

      return Task.CompletedTask;
   }

   public Task Clear()
   {
      var cacheKeys = _cache.Value.Select(kvp => kvp.Key).ToList();
      foreach (var cacheKey in cacheKeys)
      {
         _cache.Value.Remove(cacheKey);
      }

      return Task.CompletedTask;
   }

   public Task Clear(string key)
   {
      _cache.Value.Remove(key);

      return Task.CompletedTask;
   }
}