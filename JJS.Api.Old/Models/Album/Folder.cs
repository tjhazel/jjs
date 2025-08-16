using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace JJS.Api.Models.Album
{
   public class Folder
   {
      public IEnumerable<Folder> Folders { get; set; }
      public IEnumerable<File> Files { get; set; }

      public string Name { get; set; }
      [JsonIgnore]
      public string FullName { get; set; }
      public string RelativePath { get; set; }

      public DateTime CreatedOn { get; set; }
      public DateTime ModifiedOn { get; set; }
      public DateTime LastAccessTime { get; set; }
   }
}
