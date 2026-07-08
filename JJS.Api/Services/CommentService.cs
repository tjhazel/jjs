using JJS.Api.Extensions;
using JJS.Api.Models;
using JJS.Api.Models.Comment;
using JJS.Api.Models.People;
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

   public async Task Add(int postId, NewCommentRequest request, ClaimsUser user, string? authorIp)
   {
      var input = new CommentInput
      {
         PostFk = postId,
         Title = request.Title,
         EntryText = request.EntryText,
         AuthorName = user.DisplayName,
         AuthorEmail = user.Email,
         AuthorUrl = null,
         AuthorIp = authorIp?[..Math.Min(authorIp.Length, 15)],
      };
      await _commentRepository.Add(input);
      await _cacheService.Clear($"{CacheKey.CommentByPostCacheName}/{postId}");
   }
}

public interface ICommentService
{
   Task<IEnumerable<Comment>> GetByPost(int postId);
   Task Add(int postId, NewCommentRequest request, ClaimsUser user, string? authorIp);
}
