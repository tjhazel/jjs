using System;

namespace JJS.Api.Models.Recipe
{
   public class Recipe
   {
      public int RecipeId { get; set; }
      public string Name { get; set; }
      public string Description { get; set; }
      public string RecipeSource { get; set; }
      public string Course { get; set; }
      public string DishType { get; set; }
      public int Calories { get; set; }
      public int Fat { get; set; }
      public int NumberServed { get; set; }
      public string PrepTime { get; set; }
      public string CookTime { get; set; }
      public decimal EstimatedCost { get; set; }
     // public int PictureFk { get; set; }
      public bool IsViewableByPublic { get; set; }
      public long ViewCount { get; set; }
      public DateTime CreatedDate { get; set; }
      public string CreatedByFk { get; set; }
      public DateTime ModifiedDate { get; set; }
      public string ModifiedByFk { get; set; }
   }
}
