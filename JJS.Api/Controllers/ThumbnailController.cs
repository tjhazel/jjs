using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThumbnailController(IAlbumService albumService) : ControllerBase
{
   private const int ThumbSize = 400;
   private const string ThumbFolder = ".thumbs";

   [HttpGet("{*path}")]
   public async Task<IActionResult> Get(string path)
   {
      var normalizedPath = path.Replace('/', Path.DirectorySeparatorChar);
      var sourceFullPath = Path.Combine(albumService.AlbumRoot, normalizedPath);

      if (!System.IO.File.Exists(sourceFullPath))
         return NotFound();

      var thumbRelDir = Path.GetDirectoryName(normalizedPath) ?? "";
      var thumbDir    = Path.Combine(albumService.AlbumRoot, ThumbFolder, thumbRelDir);
      var thumbPath   = Path.Combine(thumbDir, Path.GetFileNameWithoutExtension(normalizedPath) + ".jpg");

      if (!System.IO.File.Exists(thumbPath))
      {
         Directory.CreateDirectory(thumbDir);
         var tmpPath = thumbPath + ".tmp";
         using var image = await Image.LoadAsync(sourceFullPath);
         image.Mutate(x => x.Resize(new ResizeOptions
         {
            Mode = ResizeMode.Max,
            Size = new Size(ThumbSize, ThumbSize)
         }));
         await image.SaveAsJpegAsync(tmpPath, new JpegEncoder { Quality = 75 });
         System.IO.File.Move(tmpPath, thumbPath, overwrite: true);
      }

      Response.Headers["Cache-Control"] = "public, max-age=86400";
      return File(System.IO.File.OpenRead(thumbPath), "image/jpeg");
   }
}
