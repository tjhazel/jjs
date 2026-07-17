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
   ICacheService cacheService,
   ICommentModerationService commentModerationService) : ICommentService
{
   private readonly ICommentRepository _commentRepository = commentRepository;
   private readonly ICacheService _cacheService = cacheService;
   private readonly ICommentModerationService _commentModerationService = commentModerationService;

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
         ParentCommentFk = request.ParentCommentFk,
         Title = request.Title,
         EntryText = request.EntryText,
         AuthorName = user.DisplayName,
         AuthorEmail = user.Email,
         AuthorIp = authorIp?[..Math.Min(authorIp.Length, 15)],
      };

      var moderation = await _commentModerationService.CheckCommentAsync($"{request.Title} {request.EntryText}".Trim());
      if (moderation.WasProcessed)
      {
         input.ScreenedBy = "Gemini AI";
         input.ScreenResult = moderation.Reason;
      }
      if (moderation.IsFlagged)
      {
         input.AdminHidden = true;
      }

      await _commentRepository.Add(input);
      if (request.ParentCommentFk.HasValue)
         await _cacheService.ClearByPrefix($"{CacheKey.ReplyByCommentCacheName}/{request.ParentCommentFk}");
      else
         await _cacheService.ClearByPrefix($"{CacheKey.CommentByPostCacheName}/{postId}");
   }

   public Task<IEnumerable<Comment>> GetReplies(int commentId, bool isAdmin)
   {
      var cacheKey = $"{CacheKey.ReplyByCommentCacheName}/{commentId}/{(isAdmin ? "admin" : "public")}";
      return _cacheService.GetCachedValue(
         () => _commentRepository.GetReplies(commentId, isAdmin),
         cacheKey);
   }

   public async Task Hide(int commentId, string screenedBy, string? screenResult)
   {
      await _commentRepository.Hide(commentId, screenedBy, screenResult);
      await _cacheService.Clear();
   }

   public async Task Unhide(int commentId)
   {
      await _commentRepository.Unhide(commentId);
      await _cacheService.Clear();
   }

   public Task<IEnumerable<CommentSummary>> GetAll(string? email, int? postId)
   {
      return _commentRepository.GetAll(email, postId);
   }
}

public interface ICommentService
{
   Task<PagedResult<Comment>> GetByPost(int postId, int page, bool isAdmin);
   Task<IEnumerable<Comment>> GetReplies(int commentId, bool isAdmin);
   Task Add(int postId, NewCommentRequest request, ClaimsUser user, string? authorIp);
   Task Hide(int commentId, string screenedBy, string? screenResult);
   Task Unhide(int commentId);
   Task<IEnumerable<CommentSummary>> GetAll(string? email, int? postId);
}
