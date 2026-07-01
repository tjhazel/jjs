using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Post;
using JJS.Api.Repositories;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IPostService))]
public class PostService(
   IPostRepository postRepository, 
   IAlbumService albumService,
   IUserService userService) :IPostService
{
   private readonly IPostRepository _postRepository = postRepository;
   private readonly IAlbumService _albumService = albumService;
   private readonly IUserService _userService = userService;

   public async Task<IEnumerable<PostViewModel>> GetPublic()
   {
      var allPosts = await _postRepository.GetAll(isPublic: true);
      await MatchImages(allPosts);
      return allPosts
         .OrderByDescending(p => p.ReleaseDate ?? p.CreatedDate)
         .ToArray();
   }

   public async Task View(int postId)
   {
      await _postRepository.View(postId);
   }

   public async Task<IEnumerable<PostViewModel>> GetAll()
   {
      var allPosts = await _postRepository.GetAll(isPublic: false);
      await MatchImages(allPosts);
      return allPosts
         .OrderByDescending(p => p.ReleaseDate ?? p.CreatedDate)
         .ToArray(); ;
   }

   /// <summary>
   /// Method used to try to match an image to a post
   /// </summary>
   /// <param name="posts"></param>
   /// <returns></returns>
   private async Task MatchImages(IEnumerable<PostViewModel> posts)
   {
      Random random = new();
      Dictionary<string, Models.Album.File> usedImages = new();

      var photos = await _albumService.GetFlatList();
      foreach (var post in posts)
      {
         var first = photos.Values.FirstOrDefault(y =>

               post.Body.Contains(y.Title, StringComparison.OrdinalIgnoreCase) ||
               post.Title.Contains(y.Title, StringComparison.OrdinalIgnoreCase) ||

               //post.Body.Contains(y.Comment, StringComparison.OrdinalIgnoreCase) ||
               //post.Title.Contains(y.Comment, StringComparison.OrdinalIgnoreCase) ||

               post.Body.Contains(y.Name, StringComparison.OrdinalIgnoreCase) ||
               post.Title.Contains(y.Name, StringComparison.OrdinalIgnoreCase) ||
               
               string.Join(' ', post.Categories ?? []).Contains(y.Title, StringComparison.OrdinalIgnoreCase)
            );

         int attempts = 0;
         //no matches, grab a random image
         while (first == null && attempts++ < 10 && photos.Count > 0)
         {
            var nextImg = photos.Values.ElementAt(random.Next(photos.Count));
            if (!usedImages.ContainsKey(nextImg.HttpPath))
            {
               first = nextImg;
            }
         }
         if (first != null)
         {
            post.ImageUrl = first.HttpPath;
            usedImages[first.HttpPath] = first;
         }
      }
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
