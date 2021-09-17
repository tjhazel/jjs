using System;
using System.Collections.Generic;

namespace JJS.Api.Models.Article
{
   public class Post
   {
      public int? PostId { get; set; }
      public string Title { get; set; }
      public string PreviewText { get; set; }
      public int Body { get; set; }
      public DateTime? ReleaseDate{ get; set; }
      public DateTime? ExpireDate { get; set; }
      public bool CommentsEnabled { get; set; }
      public bool Approved { get; set; }
      public long ViewCount{ get; set; }
      public DateTime CreatedDate { get; set; }
      public string CreatedByFk { get; set; }
      public DateTime ModifiedDate { get; set; }
      public string ModifiedByFk { get; set; }

      public virtual IEnumerable<Category> Categories { get; set; }
   }
}
