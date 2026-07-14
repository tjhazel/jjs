using JJS.Api.Models;
using JJS.Api.Models.Album;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IMetaDataService))]
public class MetaDataService() : IMetaDataService
{
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
}

public interface IMetaDataService
{
   Task<ImageTag?> GetMetadata(string filePath);
}
