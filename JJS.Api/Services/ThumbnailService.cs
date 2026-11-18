using JJS.Api.Models;
using ImageMagick;
using ImageMagick.Drawing;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IThumbnailService))]
public class ThumbnailService(IAlbumService albumService) : IThumbnailService
{
   private readonly IAlbumService _albumService = albumService;
   private const int ThumbSize = 400;
   private const string ThumbFolder = ".thumbs";
   private const string WatermarkVersion = "jjs-thumbnail-watermark-v6";
   private static readonly string CopyrightText = $"© 2006 - {DateTime.Now.Year} johnandjeri.com";

   public Task<string?> GetOrCreateThumbPathAsync(string relativePath)
   {
      var normalizedPath = relativePath.Replace('/', Path.DirectorySeparatorChar);
      var sourceFullPath = Path.Combine(_albumService.AlbumRoot, normalizedPath);

      if (!File.Exists(sourceFullPath))
         return Task.FromResult<string?>(null);

      var thumbRelDir = Path.GetDirectoryName(normalizedPath) ?? "";
      var thumbDir    = Path.Combine(_albumService.AlbumRoot, ThumbFolder, thumbRelDir);
      var thumbPath   = Path.Combine(thumbDir, Path.GetFileNameWithoutExtension(normalizedPath) + ".jpg");

      if (!File.Exists(thumbPath) || !HasCurrentWatermark(thumbPath))
      {
         Directory.CreateDirectory(thumbDir);
         var tmpPath = thumbPath + ".tmp";
         using var image = new MagickImage(sourceFullPath);
         var scale = Math.Min((double)ThumbSize / image.Width, (double)ThumbSize / image.Height);
         image.Resize(
            (uint)Math.Max(1, Math.Round(image.Width * scale)),
            (uint)Math.Max(1, Math.Round(image.Height * scale)));
         ApplyWatermark(image);
         ApplyCopyrightExif(image);
         image.Format = MagickFormat.Jpeg;
         image.Quality = 75;
         image.Write(tmpPath, MagickFormat.Jpeg);
         File.Move(tmpPath, thumbPath, overwrite: true);
      }

      return Task.FromResult<string?>(thumbPath);
   }

   private static bool HasCurrentWatermark(string path)
   {
      try
      {
         using var image = new MagickImage(path);
         return image.GetExifProfile()?.GetValue(ExifTag.Software)?.Value == WatermarkVersion;
      }
      catch { return false; }
   }

   private static void ApplyWatermark(MagickImage image)
   {
      var fontSize = Math.Max(12, image.Width * 0.045);
      image.Draw(new Drawables()
         .Font(GetWatermarkFont())
         .FontPointSize(fontSize)
         .Gravity(Gravity.South)
         .FillColor(MagickColor.FromRgb(0, 0, 0))
         .FillOpacity(new Percentage(27))
         .Text(1, 55, CopyrightText));
      image.Draw(new Drawables()
         .Font(GetWatermarkFont())
         .FontPointSize(fontSize)
         .Gravity(Gravity.South)
         .FillColor(MagickColor.FromRgb(255, 255, 255))
         .FillOpacity(new Percentage(33))
         .Text(0, 56, CopyrightText));
   }

   private static string GetWatermarkFont() => OperatingSystem.IsWindows() ? "Arial" : "DejaVu-Sans";

   private static void ApplyCopyrightExif(MagickImage image)
   {
      var exif = image.GetExifProfile() ?? new ExifProfile();
      exif.SetValue(ExifTag.Copyright, CopyrightText);
      exif.SetValue(ExifTag.Software, WatermarkVersion);
      image.SetProfile(exif);
   }
}

public interface IThumbnailService
{
   /// <summary>Returns the on-disk path to the cached thumbnail, generating it if needed. Returns null if the source file does not exist.</summary>
   Task<string?> GetOrCreateThumbPathAsync(string relativePath);
}
