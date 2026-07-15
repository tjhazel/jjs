using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThumbnailController(IThumbnailService thumbnailService) : ControllerBase
{
   [HttpGet("{*path}")]
   public async Task<IActionResult> Get(string path)
   {
      var thumbPath = await thumbnailService.GetOrCreateThumbPathAsync(path);

      if (thumbPath is null)
         return NotFound();

      Response.Headers["Cache-Control"] = "public, max-age=86400";
      return File(System.IO.File.OpenRead(thumbPath), "image/jpeg");
   }
}
