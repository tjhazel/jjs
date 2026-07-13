using JJS.Api.Services.Cache;

namespace JJS.Api.Tests.Fakes;

/// <summary>
/// In-memory stand-in for ICacheService.
/// Supports Seed() for pre-loading test data and Contains() for asserting cache state.
/// GetCachedValue implements real hit/miss logic so cache-hit tests can skip data accessors.
/// </summary>
internal sealed class FakeCacheService : ICacheService
{
    private readonly Dictionary<string, object?> _store = new();

    public void Seed<T>(string key, T value) where T : class => _store[key] = value;
    public bool Contains(string key) => _store.ContainsKey(key);

    public Task<bool> TryGetValue<T>(string key, out T value) where T : class
    {
        if (_store.TryGetValue(key, out var obj) && obj is T typed)
        {
            value = typed;
            return Task.FromResult(true);
        }
        value = null!;
        return Task.FromResult(false);
    }

    public async Task<T> GetCachedValue<T>(Func<Task<T>> dataAccessMethod, string cacheKey) where T : class
    {
        if (await TryGetValue<T>(cacheKey, out var cached))
            return cached;
        var result = await dataAccessMethod();
        if (result != null)
            _store[cacheKey] = result;
        return result!;
    }

    public async Task<U> GetCachedValue<T, U>(Func<T, Task<U>> dataAccessMethod, T parameter, string cacheKey) where U : class
    {
        if (await TryGetValue<U>(cacheKey, out var cached))
            return cached;
        var result = await dataAccessMethod(parameter);
        if (result != null)
            _store[cacheKey] = result;
        return result!;
    }

    public Task Set(string key, object value)                              { _store[key] = value; return Task.CompletedTask; }
    public Task Set(string key, DateTime absoluteExpiration, object value) { _store[key] = value; return Task.CompletedTask; }
    public Task Clear()          { _store.Clear();       return Task.CompletedTask; }
    public Task Clear(string key){ _store.Remove(key);   return Task.CompletedTask; }

    public Task ClearByPrefix(string prefix)
    {
        foreach (var k in _store.Keys.Where(k => k.StartsWith(prefix)).ToList())
            _store.Remove(k);
        return Task.CompletedTask;
    }
}
