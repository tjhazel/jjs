using JJS.Api.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Processing;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IPostImageService))]
public class PostImageService(IAlbumService albumService) : IPostImageService
{
   private readonly string _postImagesPath = Path.Combine(albumService.AlbumRoot, "PostImages");
   private const int MaxDimension = 1920;
   private const int JpegQuality  = 75;

   public async Task<(string Url, string FileName)> Upload(IFormFile file)
   {
      Directory.CreateDirectory(_postImagesPath);

      // Always output JPEG, so normalise the extension before reserving a filename.
      var jpegFileName = Path.ChangeExtension(file.FileName, ".jpg");
      var uniqueName   = ResolveUniqueFileName(jpegFileName);
      var fullPath     = Path.Combine(_postImagesPath, uniqueName);

      await using var inputStream = file.OpenReadStream();
      using var image = await Image.LoadAsync(inputStream);

      // Snapshot Exif title / comment fields before any processing.
      var srcExif = image.Metadata.ExifProfile;
      IExifValue<string>? imageDescription = null;
      IExifValue<string>? xpTitle          = null;
      IExifValue<string>? xpComment        = null;

      if (srcExif is not null)
      {
         srcExif.TryGetValue(ExifTag.ImageDescription, out imageDescription);
         srcExif.TryGetValue(ExifTag.XPTitle,          out xpTitle);
         srcExif.TryGetValue(ExifTag.XPComment,        out xpComment);
      }

      // Resize so neither dimension exceeds 1920 px (preserves aspect ratio).
      if (image.Width > MaxDimension || image.Height > MaxDimension)
      {
         image.Mutate(ctx => ctx.Resize(new ResizeOptions
         {
            Mode = ResizeMode.Max,
            Size = new Size(MaxDimension, MaxDimension),
         }));
      }

      // Re-apply title / comment in case the resize/format-change stripped them.
      var outExif = image.Metadata.ExifProfile ??= new ExifProfile();
      if (imageDescription is not null) outExif.SetValue(ExifTag.ImageDescription, imageDescription.Value);
      if (xpTitle          is not null) outExif.SetValue(ExifTag.XPTitle,          xpTitle.Value);
      if (xpComment        is not null) outExif.SetValue(ExifTag.XPComment,        xpComment.Value);

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
