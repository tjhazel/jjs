using JJS.Api.Models;
using JJS.Api.Models.Album;
using ImageMagick;
using System.Text;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IMetaDataService))]
public class MetaDataService() : IMetaDataService
{
   private const int MaxDimension = 1920;
   private static readonly string CopyrightText = $"© 2006 - {DateTime.Now.Year} johnandjeri.com";

   public Task<ImageTag?> GetMetadata(string filePath)
   {
      try
      {
         using var image = new MagickImage();
         image.Ping(filePath);
         var exif = image.GetExifProfile();

         string? title = null, comment = null;

         if (exif is not null)
         {
            var xpTitle = GetXpText(exif.GetValue(ExifTag.XPTitle)?.Value);
            title = string.IsNullOrWhiteSpace(xpTitle)
               ? Normalize(exif.GetValue(ExifTag.ImageDescription)?.Value)
               : xpTitle;
            comment = GetXpText(exif.GetValue(ExifTag.XPComment)?.Value);
         }

         if (string.IsNullOrWhiteSpace(title))
            title = Path.GetFileNameWithoutExtension(filePath);

         return Task.FromResult<ImageTag?>(new ImageTag { Title = title, Comment = comment ?? "" });
      }
      catch (Exception ex)
      {
         Console.WriteLine($"Skipping corrupted or invalid image file: {filePath}. Error: {ex.Message}");
         return Task.FromResult<ImageTag?>(null);
      }
   }

   public void RefineImage(MagickImage image)
   {
      var srcExif = image.GetExifProfile();
      var imageDescription = Normalize(srcExif?.GetValue(ExifTag.ImageDescription)?.Value);
      var xpTitle = GetXpText(srcExif?.GetValue(ExifTag.XPTitle)?.Value);
      var xpComment = GetXpText(srcExif?.GetValue(ExifTag.XPComment)?.Value);

      // Resize so neither dimension exceeds 1920 px (preserves aspect ratio).
      if (image.Width > MaxDimension || image.Height > MaxDimension)
      {
         var scale = Math.Min((double)MaxDimension / image.Width, (double)MaxDimension / image.Height);
         image.Resize(
            (uint)Math.Max(1, Math.Round(image.Width * scale)),
            (uint)Math.Max(1, Math.Round(image.Height * scale)));
      }

      var outExif = image.GetExifProfile() ?? new ExifProfile();
      if (imageDescription is not null) outExif.SetValue(ExifTag.ImageDescription, imageDescription);
      if (xpTitle is not null) outExif.SetValue(ExifTag.XPTitle, Encoding.Unicode.GetBytes(xpTitle + "\0"));
      if (xpComment is not null) outExif.SetValue(ExifTag.XPComment, Encoding.Unicode.GetBytes(xpComment + "\0"));
      outExif.SetValue(ExifTag.Copyright, CopyrightText);
      image.SetProfile(outExif);
   }

   private static string? GetXpText(object? value) => value switch
   {
      byte[] bytes => Normalize(Encoding.Unicode.GetString(bytes)),
      string text => Normalize(text),
      _ => null
   };

   private static string? Normalize(string? value) => value?.Replace("\0", "").Trim();
}

public interface IMetaDataService
{
   Task<ImageTag?> GetMetadata(string filePath);
   void RefineImage(MagickImage image);
}
