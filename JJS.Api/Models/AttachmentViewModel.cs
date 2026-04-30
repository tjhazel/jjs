
using System.Text.Json.Serialization;

namespace JJS.Api.Models;

public class AttachmentViewModel
{
   //public AttachmentViewModel(Attachment source) 
   //{
   //   Name = source.Name;
   //   FileName = source.FileName;
   //   FileSize = source.FileSize;
   //   ContentType = source.ContentType;
   //   DownloadCount = source.DownloadCount;
   //   Content = source.Content;
   //}

   public string Name { get; set; }
   public string FileName { get; set; }
   public int FileSize { get; set; } = 0;
   public string ContentType { get; set; }
   public long DownloadCount { get; set; } = 0;
   [JsonIgnore]
   public byte[] Content { get; set; }
   public string? ContentBase65
   { 
      get { return Content != null ? Convert.ToBase64String(Content) : null; }
   }

   public static AttachmentViewModel FromAttachment(Attachment source)
   {
      return new AttachmentViewModel
      {
         Name = source.Name,
         FileName = source.FileName,
         FileSize = source.FileSize,
         ContentType = source.ContentType,
         DownloadCount = source.DownloadCount,
         Content = source.Content
      };
   }
}
