using JJS.Api.Models;
using JJS.Api.Models.Album;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IMetaDataService))]
public class MetaDataService : IMetaDataService
{
   public ImageTag GetMetadata(string filePath)
   {
      string? title = null, comment = null;
      var directories = ImageMetadataReader.ReadMetadata(filePath);

      //foreach (var directory in directories)
      //   foreach (var tag in directory.Tags)
      //      System.Diagnostics.Debug.WriteLine($"{directory.Name} - {tag.Name} = {tag.Description}");

      //Exif IFD0 -Windows XP Title = Sidney Presents The Rainbow
      //Exif IFD0 - Windows XP Comment = Shadow Mountain Lake, July 3rd

      var subIfdDirectory = directories.OfType<ExifIfd0Directory>().FirstOrDefault();
      if (subIfdDirectory != null)
      {
         var titleTag = subIfdDirectory.Tags.FirstOrDefault(y => y.Name.Contains("title", StringComparison.OrdinalIgnoreCase));
         if (titleTag != null)
         {
            title = titleTag.Description;
         }
         if (string.IsNullOrWhiteSpace(title))
         {
            title = System.IO.Path.GetFileNameWithoutExtension(filePath);
         }

         var commentTag = subIfdDirectory.Tags.FirstOrDefault(y => y.Name.Contains("comment", StringComparison.OrdinalIgnoreCase));
         if (commentTag != null)
         {
            comment = commentTag.Description;
         }
      }

      if (string.IsNullOrWhiteSpace(title))
      {
         title = System.IO.Path.GetFileNameWithoutExtension(filePath);
      }

      var image = new ImageTag
      {
         Title = title,
         Comment = comment,
      };

      return image;
   }

   //public void SaveMetadata(string filePath, ImageTag tag)
   //{
   //   var tfile = TagLib.File.Create(filePath);
   //   tfile.Tag.Title = tag.Title;
   //   tfile.Tag.Comment = tag.Comment;
   //   tfile.Save();
   //}
}

///// <summary>
///// See https://github.com/mono/taglib-sharp
/////
///// NOTE: this library things comment and title are one in the same
/////
///// </summary>
//[ServiceImplementation(typeof(ITagData))]
//public class TagData : ITagData
//{
//   public TagData()
//   {
//   }

//   public ImageTag GetMetadata(string filePath)
//   {
//      var tfile = TagLib.File.Create(filePath, TagLib.ReadStyle.Average);

//      var image = new ImageTag
//      {
//         Title = tfile.Tag.Title,
//         Comment = tfile.Tag.Comment,
//      };

//      return image;
//   }

//   public void SaveMetadata(string filePath, ImageTag tag)
//   {
//      var tfile = TagLib.File.Create(filePath);
//      tfile.Tag.Title = tag.Title;
//      tfile.Tag.Comment = tag.Comment;
//      tfile.Save();
//   }
//}

public interface IMetaDataService
{
   ImageTag GetMetadata(string filePath);
   // void SaveMetadata(string filePath, ImageTag tag);
}
