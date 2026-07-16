
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
         select x.RecipeFk, x.RecipeCategoryFk, _cat.[Name] 'CategoryName'
          from RecipeCategory_xref x
             left join RecipeCategories _cat on _cat.RecipeCategoryId = x.RecipeCategoryFk
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


   const string MERGE_SQL = """
      MERGE [Recipes] AS TARGET
      USING (
         VALUES (@RecipeId
            ,@Name
            ,@Description
            ,@RecipeSource
            ,@Course
            ,@DishType
            ,@Calories
            ,@Fat
            ,@NumberServed
            ,@PrepTime
            ,@CookTime
            ,@EstimatedCost
            ,@PictureFk
            ,@IsViewableByPublic
            ,@ViewCount
            ,@CreatedDate
            ,@CreatedByFk
            ,@ModifiedDate
            ,@ModifiedByFk)
      ) AS SOURCE (RecipeId
            ,[Name]
            ,[Description]
            ,RecipeSource
            ,Course
            ,DishType
            ,Calories
            ,Fat
            ,NumberServed
            ,PrepTime
            ,CookTime
            ,EstimatedCost
            ,PictureFk
            ,IsViewableByPublic
            ,ViewCount
            ,CreatedDate
            ,CreatedByFk
            ,ModifiedDate
            ,ModifiedByFk)
      ON SOURCE.RecipeId = TARGET.RecipeId
      WHEN MATCHED THEN
         UPDATE SET
             [Name]             = SOURCE.[Name]
            ,[Description]      = SOURCE.[Description]
            ,RecipeSource       = SOURCE.RecipeSource
            ,Course             = SOURCE.Course
            ,DishType           = SOURCE.DishType
            ,Calories           = SOURCE.Calories
            ,Fat                = SOURCE.Fat
            ,NumberServed       = SOURCE.NumberServed
            ,PrepTime           = SOURCE.PrepTime
            ,CookTime           = SOURCE.CookTime
            ,EstimatedCost      = SOURCE.EstimatedCost
            ,PictureFk          = SOURCE.PictureFk
            ,IsViewableByPublic = SOURCE.IsViewableByPublic
            ,ViewCount          = SOURCE.ViewCount
            ,CreatedDate        = SOURCE.CreatedDate
            ,CreatedByFk        = SOURCE.CreatedByFk
            ,ModifiedDate       = SOURCE.ModifiedDate
            ,ModifiedByFk       = SOURCE.ModifiedByFk
      WHEN NOT MATCHED BY TARGET THEN
         INSERT ([Name]
            ,[Description]
            ,RecipeSource
            ,Course
            ,DishType
            ,Calories
            ,Fat
            ,NumberServed
            ,PrepTime
            ,CookTime
            ,EstimatedCost
            ,PictureFk
            ,IsViewableByPublic
            ,ViewCount
            ,CreatedDate
            ,CreatedByFk
            ,ModifiedDate
            ,ModifiedByFk)
         VALUES (SOURCE.[Name]
            ,SOURCE.[Description]
            ,SOURCE.RecipeSource
            ,SOURCE.Course
            ,SOURCE.DishType
            ,SOURCE.Calories
            ,SOURCE.Fat
            ,SOURCE.NumberServed
            ,SOURCE.PrepTime
            ,SOURCE.CookTime
            ,SOURCE.EstimatedCost
            ,SOURCE.PictureFk
            ,SOURCE.IsViewableByPublic
            ,SOURCE.ViewCount
            ,SOURCE.CreatedDate
            ,SOURCE.CreatedByFk
            ,SOURCE.ModifiedDate
            ,SOURCE.ModifiedByFk)
      OUTPUT inserted.RecipeId
      ;
      """;
}
