namespace JJS.Api.Services.Cache;

 public interface ICacheService
 {     
     Task<bool> TryGetValue<T>(string key, out T value) where T : class;
     Task<T> GetCachedValue<T>(Func<Task<T>> dataAccessMethod, string cacheKey) where T : class;
     Task<U> GetCachedValue<T, U>(Func<T, Task<U>> dataAccessMethod, T parameter, string cacheKey) where U : class;
     Task Set(string key, object value);
     Task Set(string key, DateTime absoluteExpiration, object value);
     Task Clear();
     Task Clear(string key);
 }