using JJS.Api.Models;
using JJS.Api.Repositories;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IPostService))]
public class PostService(IPostRepository _postRepository, IAlbumService _albumService):IPostService
{
   public async Task<IEnumerable<Post>> GetAll()
   {
      var photos = await _albumService.GetFlatList();

      var allPosts = await _postRepository.GetAll();
      Random random = new();

      foreach (var post in allPosts)
      {
         var first = photos.Values.FirstOrDefault(y =>
         
               post.Body.Contains(y.Title, StringComparison.OrdinalIgnoreCase) ||
               post.Title.Contains(y.Title, StringComparison.OrdinalIgnoreCase) ||

               post.Body.Contains(y.Comment, StringComparison.OrdinalIgnoreCase) ||
               post.Title.Contains(y.Comment, StringComparison.OrdinalIgnoreCase) ||

               post.Body.Contains(y.Name, StringComparison.OrdinalIgnoreCase) ||
               post.Title.Contains(y.Name, StringComparison.OrdinalIgnoreCase) ||

               string.Join(' ', post.Categories ?? []).Contains(y.Title, StringComparison.OrdinalIgnoreCase)
            );


         //no matches, grab a random image
         if (first == null)
         {
            first = photos.Values.ElementAt(random.Next(photos.Count));
         }
         if (first != null)
         {
            post.ImageUrl = first.HttpPath;
         }
      }
      return allPosts;

   }
}

public interface IPostService
{
   Task<IEnumerable<Post>> GetAll();
}
