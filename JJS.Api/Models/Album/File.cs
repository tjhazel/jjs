using System;
using System.Text.Json.Serialization;

namespace JJS.Api.Models.Album;

public class File
{
   public string Title { get; set; }
   public string Comment { get; set; }

   public string Name { get; set; }
   [JsonIgnore]
   public string FullName { get; set; }
   public string RelativePath { get; set; }
   public string HttpPath { get; set; }
   public string ThumbHttpPath { get; set; }

   public DateTime CreatedOn { get; set; }
   public DateTime ModifiedOn { get; set; }
   public DateTime LastAccessTime { get; set; }
}
