using JJS.Api.Models;
using JJS.Api.Repositories;

namespace JJS.Api.Services;


public class PostService(PostRepository _postRepository)
{
   public async Task<IEnumerable<Post>> GetAll()
   {
      return await _postRepository.GetAll();
   }
}
