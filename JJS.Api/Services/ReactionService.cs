using JJS.Api.Models;
using JJS.Api.Models.Reaction;
using JJS.Api.Repositories;
using JJS.Api.Services.Cache;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IReactionService))]
public class ReactionService(
    IReactionRepository reactionRepository,
    ICacheService cacheService) : IReactionService
{
    private readonly IReactionRepository _reactionRepository = reactionRepository;
    private readonly ICacheService _cacheService = cacheService;

    public Task<ReactionSummary> GetByPost(int postId, string? email)
    {
        var cacheKey = $"{CacheKey.ReactionByPostCacheName}/{postId}/{email ?? "anon"}";
        return _cacheService.GetCachedValue(
            () => _reactionRepository.GetByPost(postId, email),
            cacheKey);
    }

    public async Task Toggle(int postId, string email, string emoji)
    {
        await _reactionRepository.Toggle(postId, email, emoji);
        await _cacheService.ClearByPrefix($"{CacheKey.ReactionByPostCacheName}/{postId}");
        await _cacheService.ClearByPrefix(CacheKey.PostPublicCacheName);
        await _cacheService.ClearByPrefix(CacheKey.PostAllCacheName);
    }
}

public interface IReactionService
{
    Task<ReactionSummary> GetByPost(int postId, string? email);
    Task Toggle(int postId, string email, string emoji);
}
