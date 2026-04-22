
namespace JJS.Api.Repositories.Recipe;

public partial class RecipeRepository
{
   const string GetRecipeViewModel_Sql = """
      select r.RecipeId
          ,r.[Name]
          ,r.[Description]
          ,r.RecipeSource
          ,r.Course
          ,r.DishType
          ,r.Calories
          ,r.Fat
          ,r.NumberServed
          ,r.PrepTime
          ,r.CookTime
          ,r.EstimatedCost
          ,r.PictureFk
          ,r.IsViewableByPublic
          ,r.ViewCount
          ,r.CreatedDate
          ,r.CreatedByFk
          ,cu.DisplayName 'CreatedBy'
          ,r.ModifiedDate
          ,r.ModifiedByFk
          ,mu.DisplayName 'ModifiedBy'
          ,string_agg(cat.RecipeCategoryFk, ',') 'RecipeCategoryIds'
          ,string_agg(cat.CategoryName, ',') 'RecipeCategories'
      from Recipes r
       left join (
         select top 100 x.RecipeFk, x.RecipeCategoryFk, _cat.[Name] 'CategoryName'
          from RecipeCategory_xref x
             left join RecipeCategories _cat on _cat.RecipeCategoryId = x.RecipeCategoryFk
          order by _cat.Name
       ) cat on cat.RecipeFk = r.RecipeId
      join Users cu on cu.Id = r.CreatedByFk
      join Users mu on mu.Id = r.ModifiedByFk
      where r.RecipeId = isnull(@recipeId, r.RecipeId)
      group by r.RecipeId
          ,r.[Name]
          ,r.[Description]
          ,r.RecipeSource
          ,r.Course
          ,r.DishType
          ,r.Calories
          ,r.Fat
          ,r.NumberServed
          ,r.PrepTime
          ,r.CookTime
          ,r.EstimatedCost
          ,r.PictureFk
          ,r.IsViewableByPublic
          ,r.ViewCount
          ,r.CreatedDate
          ,r.CreatedByFk
          ,cu.DisplayName
          ,r.ModifiedDate
          ,r.ModifiedByFk
          ,mu.DisplayName
      ;
      """;

}
