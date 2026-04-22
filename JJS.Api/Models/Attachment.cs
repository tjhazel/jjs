using System;
using System.Text.Json.Serialization;

namespace JJS.Api.Models;

public class Attachment
{
   public int? AttachmentId { get; set; }
   public string Name { get; set; }
   public string FileName { get; set; }

   public int FileSize { get; set; } = 0;
   public string ContentType { get; set; }
   public long DownloadCount { get; set; } = 0;
   public byte[] Content { get; set; }
}
