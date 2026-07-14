using JJS.Api.Models;
using JJS.Api.Models.Album;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using SixLabors.ImageSharp.Processing;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IMetaDataService))]
public class MetaDataService() : IMetaDataService
{
   private const int MaxDimension = 1920;

   public async Task<ImageTag?> GetMetadata(string filePath)
   {
      try
      {
         var info = await Image.IdentifyAsync(filePath);
         var exif = info.Metadata.ExifProfile;

         string? title = null, comment = null;

         if (exif is not null)
         {
            // XPTitle is the Windows "Title" field; fall back to standard ImageDescription
            if (exif.TryGetValue(ExifTag.XPTitle, out var xpTitle) && !string.IsNullOrWhiteSpace(xpTitle.Value))
               title = xpTitle.Value.Replace("\0", "").Trim();
            else if (exif.TryGetValue(ExifTag.ImageDescription, out var imgDesc))
               title = imgDesc.Value?.Replace("\0", "").Trim();

            if (exif.TryGetValue(ExifTag.XPComment, out var xpComment))
               comment = xpComment.Value.Replace("\0", "").Trim();
         }

         if (string.IsNullOrWhiteSpace(title))
            title = Path.GetFileNameWithoutExtension(filePath);

         return new ImageTag { Title = title, Comment = comment ?? "" };
      }
      catch (Exception ex)
      {
         Console.WriteLine($"Skipping corrupted or invalid image file: {filePath}. Error: {ex.Message}");
         return null;
      }
   }

   public void RefineImage(Image image)
   {
      // Snapshot Exif title / comment before any processing.
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
      if (imageDescription is not null) outExif.SetValue(ExifTag.ImageDescription, imageDescription.Value.Replace("\0", "").Trim());
      if (xpTitle          is not null) outExif.SetValue(ExifTag.XPTitle,          xpTitle.Value.Replace("\0", "").Trim());
      if (xpComment        is not null) outExif.SetValue(ExifTag.XPComment,        xpComment.Value.Replace("\0", "").Trim());
   }
}

public interface IMetaDataService
{
   Task<ImageTag?> GetMetadata(string filePath);
   void RefineImage(Image image);
}
