using JJS.Api.Models;
using JJS.Api.Models.Comment;
using JJS.Api.Repositories;
using JJS.Api.Services.Cache;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(ICommentService))]
public class CommentService(
   ICommentRepository commentRepository,
   ICacheService cacheService) : ICommentService
{
   private readonly ICommentRepository _commentRepository = commentRepository;
   private readonly ICacheService _cacheService = cacheService;

   public Task<IEnumerable<Comment>> GetByPost(int postId)
   {
      return _cacheService.GetCachedValue(
         () => _commentRepository.GetByPost(postId),
         $"{CacheKey.CommentByPostCacheName}/{postId}");
   }
}

public interface ICommentService
{
   Task<IEnumerable<Comment>> GetByPost(int postId);
}
