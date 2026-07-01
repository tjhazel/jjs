
namespace JJS.Api.Repositories;

public partial class PostRepository
{
   const string GetAll_Sql = """
      select p.PostId
         ,p.Title
         ,p.PreviewText
         ,cast(p.Body as varchar(max)) 'Body'
         ,p.ReleaseDate
         ,p.ExpireDate
         ,p.CommentsEnabled
         ,p.Approved
         ,p.ViewCount
         ,p.CreatedDate
         ,p.CreatedByFk
         ,cu.DisplayName 'CreatedBy'
         ,p.ModifiedDate
         ,p.ModifiedByFk
         ,mu.DisplayName 'ModifiedBy'
         ,string_agg(cat.CategoryFk, ',') 'CategoryIds'
         ,string_agg(cat.Title, ',') 'Categories'
      from Posts p 
         left join (
           select top 100 x.PostFk, x.CategoryFk, _cat.Title
            from PostCategories x
               left join Categories _cat on _cat.CategoryId = x.CategoryFk
            order by _cat.Title
         ) cat on cat.PostFk = p.PostId
        join Users cu on cu.Id = p.CreatedByFk
        join Users mu on mu.Id = p.ModifiedByFk
      where @isPublic <> 1
        or (@isPublic = 1 
           and p.approved = 1
           and (p.releaseDate is null or p.releaseDate <= getutcdate())
           and (p.[ExpireDate] is null or p.[ExpireDate] is null or p.[ExpireDate] <= getutcdate())
           )  
      group by p.PostId
         ,p.Title
         ,p.PreviewText
         ,cast(p.Body as varchar(max))
         ,p.ReleaseDate
         ,p.ExpireDate
         ,p.CommentsEnabled
         ,p.Approved
         ,p.ViewCount
         ,p.CreatedDate
         ,p.CreatedByFk
         ,cu.DisplayName
         ,p.ModifiedDate
         ,p.ModifiedByFk
         ,mu.DisplayName
      ;
      """;

   const string View_Sql = """
      update Posts set ViewCount = ViewCount + 1 where PostId = @postId;
      """;

   const string MERGE_SQL = """
         MERGE [Posts] AS TARGET 
         USING ( 
            VALUES (@postId
               ,@title
               ,@previewText
               ,@body
               ,@releaseDate
               ,@expireDate
               ,@commentsEnabled
               ,@approved
               ,@viewCount
               ,@createdDate
               ,@createdByFk
               ,@modifiedDate
               ,@modifiedByFk)
         ) AS SOURCE (PostId
               ,Title
               ,PreviewText
               ,Body
               ,ReleaseDate
               ,[ExpireDate]
               ,CommentsEnabled
               ,Approved
               ,ViewCount
               ,CreatedDate
               ,CreatedByFk
               ,ModifiedDate
               ,ModifiedByFk)
         ON SOURCE.PostId = TARGET.PostId
         WHEN MATCHED THEN
            UPDATE SET 
                Title = SOURCE.Title
               ,PreviewText = SOURCE.PreviewText
               ,Body = SOURCE.Body
               ,ReleaseDate = SOURCE.ReleaseDate
               ,[ExpireDate] = SOURCE.[ExpireDate]
               ,CommentsEnabled = SOURCE.CommentsEnabled
               ,Approved = SOURCE.Approved
               ,ViewCount = SOURCE.ViewCount
               ,CreatedDate = SOURCE.CreatedDate
               ,CreatedByFk = SOURCE.CreatedByFk
               ,ModifiedDate = SOURCE.ModifiedDate
               ,ModifiedByFk = SOURCE.ModifiedByFk

         WHEN NOT MATCHED BY Target THEN
            INSERT (Title
               ,PreviewText
               ,Body
               ,ReleaseDate
               ,[ExpireDate]
               ,CommentsEnabled
               ,Approved
               ,ViewCount
               ,CreatedDate
               ,CreatedByFk
               ,ModifiedDate
               ,ModifiedByFk)
            VALUES (SOURCE.Title
               ,SOURCE.PreviewText
               ,SOURCE.Body
               ,SOURCE.ReleaseDate
               ,SOURCE.[ExpireDate]
               ,SOURCE.CommentsEnabled
               ,SOURCE.Approved
               ,SOURCE.ViewCount
               ,SOURCE.CreatedDate
               ,SOURCE.CreatedByFk
               ,SOURCE.ModifiedDate
               ,SOURCE.ModifiedByFk
            )
         output inserted.PostId
      ;
      """;
}
