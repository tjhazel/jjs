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
   private const string WatermarkVersion = "jjs-thumbnail-watermark-v7";
   private static readonly string CopyrightText = $"© 2006 - {DateTime.Now.Year} johnandjeri.com";
   private static readonly IReadOnlyDictionary<char, string[]> WatermarkGlyphs = new Dictionary<char, string[]>
   {
      ['©'] = ["01110", "10001", "10111", "10100", "10111", "10001", "01110"],
      ['0'] = ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
      ['1'] = ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
      ['2'] = ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
      ['3'] = ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
      ['4'] = ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
      ['5'] = ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
      ['6'] = ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
      ['7'] = ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
      ['8'] = ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
      ['9'] = ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
      ['-'] = ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
      ['a'] = ["00000", "01110", "00001", "01111", "10001", "10011", "01101"],
      ['c'] = ["00000", "01110", "10000", "10000", "10000", "10001", "01110"],
      ['d'] = ["00001", "00001", "01101", "10011", "10001", "10011", "01101"],
      ['e'] = ["00000", "01110", "10001", "11111", "10000", "10001", "01110"],
      ['h'] = ["10000", "10000", "10110", "11001", "10001", "10001", "10001"],
      ['i'] = ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
      ['j'] = ["00010", "00000", "00110", "00010", "00010", "10010", "01100"],
      ['m'] = ["00000", "11010", "10101", "10101", "10101", "10101", "10101"],
      ['n'] = ["00000", "10110", "11001", "10001", "10001", "10001", "10001"],
      ['o'] = ["00000", "01110", "10001", "10001", "10001", "10001", "01110"],
      ['r'] = ["00000", "10110", "11001", "10000", "10000", "10000", "10000"],
      [' '] = ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
      ['.'] = ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
   };

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
      var scale = Math.Max(1, image.Width * 0.0045);
      DrawBitmapWatermark(image, scale, 55, MagickColor.FromRgb(0, 0, 0), new Percentage(27), 1);
      DrawBitmapWatermark(image, scale, 56, MagickColor.FromRgb(255, 255, 255), new Percentage(33), 0);
   }

   private static void DrawBitmapWatermark(
      MagickImage image,
      double scale,
      int bottomOffset,
      MagickColor color,
      Percentage opacity,
      int shadowOffset)
   {
      var cellSize = scale;
      var characterWidth = cellSize * 6;
      var textWidth = characterWidth * CopyrightText.Length;
      var startX = (image.Width - textWidth) / 2 + shadowOffset;
      var startY = image.Height - bottomOffset - cellSize * 7 + shadowOffset;
      var drawables = new Drawables()
         .FillColor(color)
         .FillOpacity(opacity);

      for (var characterIndex = 0; characterIndex < CopyrightText.Length; characterIndex++)
      {
         var glyph = WatermarkGlyphs[CopyrightText[characterIndex]];
         for (var row = 0; row < glyph.Length; row++)
         {
            for (var column = 0; column < glyph[row].Length; column++)
            {
               if (glyph[row][column] != '1')
                  continue;

               var x = startX + characterIndex * characterWidth + column * cellSize;
               var y = startY + row * cellSize;
               drawables.Rectangle(x, y, x + cellSize, y + cellSize);
            }
         }
      }

      image.Draw(drawables);
   }

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
