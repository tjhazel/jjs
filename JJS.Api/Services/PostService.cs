using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Post;
using JJS.Api.Repositories;
using JJS.Api.Services.Cache;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IPostService))]
public class PostService(
   IPostRepository postRepository,
   IImageMatchService imageMatchService,
   IUserService userService,
   ICacheService cacheService) : IPostService
{
   private readonly IPostRepository _postRepository = postRepository;
   private readonly IImageMatchService _imageMatchService = imageMatchService;
   private readonly IUserService _userService = userService;
   private readonly ICacheService _cacheService = cacheService;

   public Task<IEnumerable<PostViewModel>> GetPublic()
   {
      return GetCachedImages(CacheKey.PostPublicCacheName, isPublic: true);
   }

   public async Task View(int postId)
   {
      await _postRepository.View(postId);
   }

   public Task<IEnumerable<PostViewModel>> GetAll()
   {
      return GetCachedImages(CacheKey.PostAllCacheName, isPublic: false);
   }

   private Task<IEnumerable<PostViewModel>> GetCachedImages(string cacheKey, bool isPublic)
   {
      return _cacheService.GetCachedValue(async () =>
      {
         var allPosts = await _postRepository.GetAll(isPublic: isPublic);
         return await FixUpResults(allPosts);
      }, cacheKey);
   }

   private async Task<IEnumerable<PostViewModel>> FixUpResults(IEnumerable<PostViewModel> posts)
   {
      await _imageMatchService.MatchImages(posts);
      return posts
         .OrderByDescending(p => p.ReleaseDate ?? p.CreatedDate)
         .ToArray();
   }

   public async Task<int> Save(Post model, ClaimsUser user)
   {
      var existingUser = await _userService.Get(user.Email);

      if (!model.PostId.HasValue)
      {
         model.CreatedDate = DateTime.UtcNow;
         model.CreatedByFk = existingUser?.Id;
      }
      model.ModifiedDate = DateTime.UtcNow;
      model.ModifiedByFk = existingUser?.Id;

      return await _postRepository.Save(model);
   }
}

public interface IPostService
{
   Task<IEnumerable<PostViewModel>> GetPublic();
   Task View(int postId);

   Task<IEnumerable<PostViewModel>> GetAll();
   Task<int> Save(Post model, ClaimsUser user);

}
