using JJS.Api.Models;
using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Processing;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IThumbnailService))]
public class ThumbnailService(IAlbumService albumService) : IThumbnailService
{
   private readonly IAlbumService _albumService = albumService;
   private const int ThumbSize = 400;
   private const string ThumbFolder = ".thumbs";
   private static readonly string CopyrightText = $"© 2006 - {DateTime.Now.Year} johnandjeri.com";

   public async Task<string?> GetOrCreateThumbPathAsync(string relativePath)
   {
      var normalizedPath = relativePath.Replace('/', Path.DirectorySeparatorChar);
      var sourceFullPath = Path.Combine(_albumService.AlbumRoot, normalizedPath);

      if (!File.Exists(sourceFullPath))
         return null;

      var thumbRelDir = Path.GetDirectoryName(normalizedPath) ?? "";
      var thumbDir    = Path.Combine(_albumService.AlbumRoot, ThumbFolder, thumbRelDir);
      var thumbPath   = Path.Combine(thumbDir, Path.GetFileNameWithoutExtension(normalizedPath) + ".jpg");

      if (!File.Exists(thumbPath) || !HasCopyrightTag(thumbPath))
      {
         Directory.CreateDirectory(thumbDir);
         var tmpPath = thumbPath + ".tmp";
         using var image = await Image.LoadAsync(sourceFullPath);
         image.Mutate(x => x.Resize(new ResizeOptions
         {
            Mode = ResizeMode.Max,
            Size = new Size(ThumbSize, ThumbSize),
         }));
         ApplyWatermark(image);
         ApplyCopyrightExif(image);
         await image.SaveAsJpegAsync(tmpPath, new JpegEncoder { Quality = 75 });
         File.Move(tmpPath, thumbPath, overwrite: true);
      }

      return thumbPath;
   }

   private static bool HasCopyrightTag(string path)
   {
      try
      {
         var info = Image.Identify(path);
         return info?.Metadata.ExifProfile?.Values
            .Any(v => v.Tag == ExifTag.Copyright) ?? false;
      }
      catch { return false; }
   }

   private static void ApplyWatermark(Image image)
   {
      if (!SystemFonts.Collection.TryGet("Arial", out var fontFamily))
         fontFamily = SystemFonts.Families.First();

      var fontSize = Math.Max(10f, image.Width * 0.032f);
      var font = fontFamily.CreateFont(fontSize, FontStyle.Regular);

      var centerX   = image.Width / 2f;
      var baselineY = image.Height - 6;

      var textOptions = new RichTextOptions(font)
      {
         HorizontalAlignment = HorizontalAlignment.Center,
         VerticalAlignment   = VerticalAlignment.Bottom,
         Origin              = new PointF(centerX, baselineY),
      };

      var shadowOptions = new RichTextOptions(textOptions)
      {
         Origin = new PointF(centerX + 1, baselineY + 1),
      };

      image.Mutate(ctx =>
      {
         ctx.DrawText(shadowOptions, CopyrightText, Color.FromRgba(0, 0, 0, 70));
         ctx.DrawText(textOptions,   CopyrightText, Color.FromRgba(255, 255, 255, 85));
      });
   }

   private static void ApplyCopyrightExif(Image image)
   {
      var exif = image.Metadata.ExifProfile ??= new ExifProfile();
      exif.SetValue(ExifTag.Copyright, CopyrightText);
   }
}

public interface IThumbnailService
{
   /// <summary>Returns the on-disk path to the cached thumbnail, generating it if needed. Returns null if the source file does not exist.</summary>
   Task<string?> GetOrCreateThumbPathAsync(string relativePath);
}
