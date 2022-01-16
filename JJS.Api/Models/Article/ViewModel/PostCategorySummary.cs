using System;

namespace JJS.Api.Models.Article.ViewModel
{
   public class PostCategorySummary
   {
      public int PostId { get; set; }
      public string Title { get; set; }
      public string PreviewText { get; set; }
      public string Body { get; set; }
      public DateTime? ReleaseDate { get; set; }
      public DateTime? ExpireDate { get; set; }
      public bool CommentsEnabled { get; set; }
      public bool Approved { get; set; }
      public long ViewCount { get; set; }
      public DateTime CreatedDate { get; set; }
      public Guid CreatedByFk { get; set; }
      public DateTime ModifiedDate { get; set; }
      public Guid ModifiedByFk { get; set; }
      public int CreatedYear { get; set; }
      public int CreatedMonth { get; set; }
      public int CreatedDay { get; set; }
      public string CrossPosts { get; set; }
      public int CategoryId { get; set; }
      public int CategoryTypeFk { get; set; }
      public string CategoryType { get; set; }
      public string CategoryTitle { get; set; }
      public string Description { get; set; }
      public string ImageUrl { get; set; }
      public int CommentCount { get; set; }
      public string CreatedBy { get; set; }
      public string ModifiedBy { get; set; }
      public string FriendlyName { get; set; }
   }
}
