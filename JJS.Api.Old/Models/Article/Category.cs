using System;

namespace JJS.Api.Models.Article
{
   public class Category
   {
      public int CategoryId { get; set; }
      public int CategoryTypeFk { get; set; }
      public string Title { get; set; }
      public string Description { get; set; }
      public string ImageUrl { get; set; }
      public DateTime CreatedDate { get; set; }
      public Guid CreatedByFk { get; set; }
      public DateTime ModifiedDate { get; set; }
      public Guid ModifiedByFk { get; set; }
   }
}
