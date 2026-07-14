using JJS.Api.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IPostImageService))]
public class PostImageService(IAlbumService albumService, IMetaDataService metaDataService) : IPostImageService
{
   private readonly string _postImagesPath = Path.Combine(albumService.AlbumRoot, "PostImages");
   private readonly IMetaDataService _metaDataService = metaDataService;
   private const int JpegQuality = 75;

   public async Task<(string Url, string FileName)> Upload(IFormFile file)
   {
      Directory.CreateDirectory(_postImagesPath);

      // Always output JPEG, so normalise the extension before reserving a filename.
      var jpegFileName = Path.ChangeExtension(file.FileName, ".jpg");
      var uniqueName   = ResolveUniqueFileName(jpegFileName);
      var fullPath     = Path.Combine(_postImagesPath, uniqueName);

      await using var inputStream = file.OpenReadStream();
      using var image = await Image.LoadAsync(inputStream);

      _metaDataService.RefineImage(image);

      await image.SaveAsJpegAsync(fullPath, new JpegEncoder { Quality = JpegQuality });

      return ($"/api/post-image/{Uri.EscapeDataString(uniqueName)}", file.FileName);
   }

   public (Stream Content, string ContentType)? GetImage(string fileName)
   {
      var safeName = Path.GetFileName(fileName);
      var fullPath = Path.Combine(_postImagesPath, safeName);

      if (!File.Exists(fullPath))
         return null;

      var ext = (Path.GetExtension(safeName) ?? string.Empty).ToLower();
      var contentType = ext switch
      {
         ".jpg" or ".jpeg" => "image/jpeg",
         ".png"            => "image/png",
         ".gif"            => "image/gif",
         ".webp"           => "image/webp",
         _                 => "application/octet-stream"
      };

      return (File.OpenRead(fullPath), contentType);
   }

   private string ResolveUniqueFileName(string originalFileName)
   {
      var name = Path.GetFileNameWithoutExtension(originalFileName);
      var ext  = Path.GetExtension(originalFileName);
      var candidate = $"{name}{ext}";

      if (!File.Exists(Path.Combine(_postImagesPath, candidate)))
         return candidate;

      for (var i = 1; ; i++)
      {
         candidate = $"{name}({i}){ext}";
         if (!File.Exists(Path.Combine(_postImagesPath, candidate)))
            return candidate;
      }
   }
}

public interface IPostImageService
{
   Task<(string Url, string FileName)> Upload(IFormFile file);
   (Stream Content, string ContentType)? GetImage(string fileName);
}
