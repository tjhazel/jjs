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

   private const int PageSize = 10;

   public Task<PagedResult<Comment>> GetByPost(int postId, int page, bool isAdmin)
   {
      var offset = (page - 1) * PageSize;
      var cacheKey = $"{CacheKey.CommentByPostCacheName}/{postId}/{page}/{(isAdmin ? "admin" : "public")}";
      return _cacheService.GetCachedValue(
         () => FetchPaged(postId, offset, isAdmin),
         cacheKey);
   }

   private async Task<PagedResult<Comment>> FetchPaged(int postId, int offset, bool isAdmin)
   {
      var items = (await _commentRepository.GetByPost(postId, offset, PageSize + 1, isAdmin)).ToList();
      return new PagedResult<Comment>
      {
         Items = items.Count > PageSize ? items.Take(PageSize).ToList() : items,
         HasMore = items.Count > PageSize
      };
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
         AuthorIp = authorIp?[..Math.Min(authorIp.Length, 15)],
      };
      await _commentRepository.Add(input);
      await _cacheService.ClearByPrefix($"{CacheKey.CommentByPostCacheName}/{postId}");
   }

   public async Task Hide(int commentId, string hiddenBy)
   {
      await _commentRepository.Hide(commentId, hiddenBy);
      await _cacheService.Clear();
   }

   public async Task Unhide(int commentId)
   {
      await _commentRepository.Unhide(commentId);
      await _cacheService.Clear();
   }
}

public interface ICommentService
{
   Task<PagedResult<Comment>> GetByPost(int postId, int page, bool isAdmin);
   Task Add(int postId, NewCommentRequest request, ClaimsUser user, string? authorIp);
   Task Hide(int commentId, string hiddenBy);
   Task Unhide(int commentId);
}
