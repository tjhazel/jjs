
namespace JJS.Api.Repositories
{
   public partial class PostRepository
   {
      const string GET_BY_ID_SQL = "SELECT * FROM Posts WHERE PostId = isnull(@postId, PostId)";

      const string GET_PostCategorySummary_SQL = @"SELECT * FROM vw_cust_PostCategorySummary;";

      const string SEARCH_PostCategorySummary_SQL = @"SELECT * FROM vw_cust_PostCategorySummary WHERE CategoryId in @categoryIds;";

      //declare @postId int, @title nvarchar(50), @previewText nvarchar(50), @body nvarchar(50), @releaseDate datetime, @expireDate datetime, @commentsEnabled bit, @approved bit, @viewCount int, @createdDate datetime, @createdByFk int, @modifiedDate datetime, @modifiedByFk int;
      const string MERGE_SQL = @"MERGE Posts AS TARGET 
   USING ( 
      VALUES (@postId, @title, @previewText, @body, @releaseDate, @expireDate, @commentsEnabled, @approved, @viewCount, @createdDate, @createdByFk, @modifiedDate, @modifiedByFk)
   ) AS SOURCE (PostId
      ,[Title]
      ,[PreviewText]
      ,[Body]
      ,[ReleaseDate]
      ,[ExpireDate]
      ,[CommentsEnabled]
      ,[Approved]
      ,[ViewCount]
      ,[CreatedDate]
      ,[CreatedByFk]
      ,[ModifiedDate]
      ,[ModifiedByFk])
   ON SOURCE.PostId = TARGET.PostId
   WHEN MATCHED THEN UPDATE SET 
      [Title] = @title
      ,[PreviewText] = @previewText
      ,[Body] = @body
      ,[ReleaseDate] = @releaseDate
      ,[ExpireDate] = @expireDate
      ,[CommentsEnabled] = @commentsEnabled
      ,[Approved] = @approved
      ,[ViewCount] = @viewCount
      ,[CreatedDate] = @createdDate
      ,[CreatedByFk] = @createdByFk
   WHEN NOT MATCHED BY Target THEN
      INSERT ([Title]
           ,[PreviewText]
           ,[Body]
           ,[ReleaseDate]
           ,[ExpireDate]
           ,[CommentsEnabled]
           ,[Approved]
           ,[ViewCount]
           ,[ModifiedDate]
           ,[ModifiedByFk])
	   VALUES (Source.[Title]
           ,Source.[PreviewText]
           ,Source.[Body]
           ,Source.[ReleaseDate]
           ,Source.[ExpireDate]
           ,Source.[CommentsEnabled]
           ,Source.[Approved]
           ,Source.[ViewCount]
           ,Source.[ModifiedDate]
           ,Source.[ModifiedByFk])
   output inserted.PostId
;";

      const string DELETE_POSTCATEGORIES_SQL = @"DELETE PostCategories 
WHERE PostFk = @postFk 
   and CategoryFk not in @categoryFks
;";

      const string MERGE_POSTCATEGORIES_SQL = @"MERGE PostCategories AS TARGET 
   USING(
      VALUES (@postFk, @categoryFk)
   ) AS SOURCE(PostFk, CategoryFk)
   ON
      SOURCE.PostFk = TARGET.PostFk AND SOURCE.CategoryFk = TARGET.CategoryFk
WHEN NOT MATCHED BY Target THEN
      INSERT (PostFk, CategoryFk)
      VALUES (Source.PostFk, Source.CategoryFk)
;";
   }

}
