using JJS.Api.Extensions;
using JJS.Api.Models;
using JJS.Api.Models.Post;
using JJS.Api.Repositories;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(ICategoryService))]
public class CategoryService(
   ICategoryRepository categoryRepository,
   IAlbumService albumService,
   IHttpContextAccessor httpContextAccessor) : ICategoryService
{
   private readonly ICategoryRepository _categoryRepository = categoryRepository;
   private readonly IAlbumService _albumService = albumService;
   private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

   public async Task<IEnumerable<Category>> Get(int categoryTypeId)
   {
      var allCategories = await _categoryRepository.Get(categoryTypeId);
      await MatchImages(allCategories);

      return (_httpContextAccessor.HttpContext?.User.UserCanSeeProtectedData() ?? false)
         ? allCategories
         : allCategories.Where(c => c.CategoryId != CategoryConstants.Facetube);
   }

   private async Task MatchImages(IEnumerable<Category> categories)
   {
      Random random = new();
      var photos = await _albumService.GetFlatList();
      if (photos == null || photos.Count() == 0) return;

      foreach (var cat in categories)
      {
         var first = photos.Values.FirstOrDefault(y =>

               cat.Title.Contains(y.Title, StringComparison.OrdinalIgnoreCase) ||
               cat.CategoryType.Contains(y.Title, StringComparison.OrdinalIgnoreCase) ||

               cat.Title.Contains(y.Comment, StringComparison.OrdinalIgnoreCase) ||
               cat.CategoryType.Contains(y.Comment, StringComparison.OrdinalIgnoreCase) ||

               cat.Title.Contains(y.Name, StringComparison.OrdinalIgnoreCase) ||
               cat.CategoryType.Contains(y.Name, StringComparison.OrdinalIgnoreCase)
            );

         //no matches, grab a random image
         if (first == null)
         {
            first = photos.Values.ElementAt(random.Next(photos.Count));
         }
         if (first != null)
         {
            cat.ImageUrl = first.HttpPath;
         }
      }
   }
}

public interface ICategoryService
{
   Task<IEnumerable<Category>> Get(int categoryTypeId);
}
