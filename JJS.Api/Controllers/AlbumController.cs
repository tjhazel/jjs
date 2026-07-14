using JJS.Api.Models;
using JJS.Api.Models.Album;
using JJS.Api.Services;
using JJS.Api.Services.Cache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumController(IAlbumService albumService, ICacheService cacheService) : Controller
{
   private readonly IAlbumService _albumService = albumService;
   private readonly ICacheService _cacheService = cacheService;

   [HttpGet]
   public async Task<Folder> Get()
   {
      return await _albumService.Get();
   }

   [HttpPost("refresh")]
   [Authorize(Roles = "Admin")]
   public async Task<IActionResult> Refresh()
   {
      var folder = await _albumService.Refresh();

      // Post caches embed resolved image URLs, so they must be invalidated whenever the album changes.
      await Task.WhenAll(
         _cacheService.Clear(CacheKey.PostAllCacheName),
         _cacheService.Clear(CacheKey.PostPublicCacheName));

      var fileCount = CountFiles(folder);
      return Ok(new { fileCount });
   }

   private static int CountFiles(Folder? folder)
   {
      if (folder == null) return 0;
      int count = folder.Files?.Count() ?? 0;
      if (folder.Folders != null)
         foreach (var sub in folder.Folders)
            count += CountFiles(sub);
      return count;
   }
}
