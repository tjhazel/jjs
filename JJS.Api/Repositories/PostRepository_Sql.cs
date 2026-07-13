
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
         ,p.Archived
         ,p.CircleOfTrust
         ,p.ViewCount
         ,p.ImageUrl
         ,p.CreatedDate
         ,p.CreatedByFk
         ,cu.DisplayName 'CreatedBy'
         ,p.ModifiedDate
         ,p.ModifiedByFk
         ,mu.DisplayName 'ModifiedBy'
         ,isnull(max(cc.CommentCount), 0) 'CommentCount'
         ,isnull(max(rc.ReactionCounts), '') 'ReactionCounts'
         ,string_agg(cast(x.CategoryFk as varchar(10)), ',') 'CategoryIds'
         ,string_agg(_cat.Title, ',') 'Categories'
      from Posts p
         left join PostCategories x on x.PostFk = p.PostId
         left join Categories _cat on _cat.CategoryId = x.CategoryFk
         left join (select PostFk, count(*) CommentCount from Comments group by PostFk) cc on cc.PostFk = p.PostId
         left join (
            select PostFk, string_agg(Emoji + ':' + cast(EmojiCount as varchar(10)), ',') as ReactionCounts
            from (select PostFk, Emoji, count(*) as EmojiCount from PostReactions group by PostFk, Emoji) x
            group by PostFk
         ) rc on rc.PostFk = p.PostId
        join Users cu on cu.Id = p.CreatedByFk
        join Users mu on mu.Id = p.ModifiedByFk
      where @isPublic <> 1
        or (@isPublic = 1
           and p.approved = 1
           and (p.Archived is null or p.Archived = 0)
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
         ,p.Archived
         ,p.CircleOfTrust
         ,p.ViewCount
         ,p.ImageUrl
         ,p.CreatedDate
         ,p.CreatedByFk
         ,cu.DisplayName
         ,p.ModifiedDate
         ,p.ModifiedByFk
         ,mu.DisplayName
      ;
      """;

   const string MergeCategories_Sql = """
      merge PostCategories as target
      using (
         select cast(Value as int) as CategoryFk
         from dbo.SplitList(@categoryIds, ',')
         where Value <> ''
      ) as source (CategoryFk)
      on target.PostFk = @postId and target.CategoryFk = source.CategoryFk
      when not matched by target then
         insert (PostFk, CategoryFk) values (@postId, source.CategoryFk)
      when not matched by source and target.PostFk = @postId then
         delete;
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
               ,@archived
               ,@circleOfTrust
               ,@viewCount
               ,@imageUrl
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
               ,Archived
               ,CircleOfTrust
               ,ViewCount
               ,ImageUrl
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
               ,Archived = SOURCE.Archived
               ,CircleOfTrust = SOURCE.CircleOfTrust
               ,ViewCount = SOURCE.ViewCount
               ,ImageUrl = SOURCE.ImageUrl
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
               ,Archived
               ,CircleOfTrust
               ,ViewCount
               ,ImageUrl
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
               ,SOURCE.Archived
               ,SOURCE.CircleOfTrust
               ,SOURCE.ViewCount
               ,SOURCE.ImageUrl
               ,SOURCE.CreatedDate
               ,SOURCE.CreatedByFk
               ,SOURCE.ModifiedDate
               ,SOURCE.ModifiedByFk
            )
         output inserted.PostId
      ;
      """;
}
