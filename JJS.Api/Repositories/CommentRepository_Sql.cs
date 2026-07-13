namespace JJS.Api.Repositories;

public partial class CommentRepository
{
   const string GetByPost_Sql = """
      select c.CommentId
         ,c.PostFk
         ,c.ParentCommentFk
         ,c.Title
         ,cast(c.EntryText as nvarchar(max)) 'EntryText'
         ,c.AuthorName
         ,c.CreatedDate
         ,c.AdminHidden
         ,c.HiddenBy
         ,c.HiddenDate
         ,case when @isAdmin = 1 then c.AuthorEmail else null end 'AuthorEmail'
         ,case when @isAdmin = 1 then isnull(u.Blocked, 0) else null end 'AuthorBlocked'
         ,(select count(*) from Comments r where r.ParentCommentFk = c.CommentId) 'ReplyCount'
      from Comments c
      left join Users u on u.Email = c.AuthorEmail
      where c.PostFk = @postId
        and c.ParentCommentFk is null
        and (@isAdmin = 1 or c.AdminHidden = 0)
      order by c.CreatedDate desc
      offset @offset rows fetch next @pageSize rows only
      ;
      """;

   const string GetReplies_Sql = """
      select c.CommentId
         ,c.PostFk
         ,c.ParentCommentFk
         ,c.Title
         ,cast(c.EntryText as nvarchar(max)) 'EntryText'
         ,c.AuthorName
         ,c.CreatedDate
         ,c.AdminHidden
         ,c.HiddenBy
         ,c.HiddenDate
         ,case when @isAdmin = 1 then c.AuthorEmail else null end 'AuthorEmail'
         ,case when @isAdmin = 1 then isnull(u.Blocked, 0) else null end 'AuthorBlocked'
         ,0 'ReplyCount'
      from Comments c
      left join Users u on u.Email = c.AuthorEmail
      where c.ParentCommentFk = @commentId
        and (@isAdmin = 1 or c.AdminHidden = 0)
      order by c.CreatedDate asc
      ;
      """;

   const string Hide_Sql = """
      update Comments
      set AdminHidden = 1
         ,HiddenBy = @hiddenBy
         ,HiddenDate = getutcdate()
      where CommentId = @commentId
      ;
      """;

   const string Unhide_Sql = """
      update Comments
      set AdminHidden = 0
         ,HiddenBy = null
         ,HiddenDate = null
      where CommentId = @commentId
      ;
      """;

   const string GetAll_Sql = """
      SELECT c.CommentId
         ,c.PostFk
         ,c.ParentCommentFk
         ,p.Title AS PostTitle
         ,c.Title
         ,cast(c.EntryText as nvarchar(max)) EntryText
         ,c.AuthorName
         ,c.AuthorEmail
         ,c.CreatedDate
         ,c.AdminHidden
         ,c.HiddenBy
         ,c.HiddenDate
         ,isnull(u.Blocked, 0) AS AuthorBlocked
         ,(select count(*) from Comments r where r.ParentCommentFk = c.CommentId) ReplyCount
      FROM Comments c
      JOIN Posts p ON p.PostId = c.PostFk
      LEFT JOIN Users u ON u.Email = c.AuthorEmail
      WHERE (@email IS NULL OR c.AuthorEmail = @email)
        AND (@postId IS NULL OR c.PostFk = @postId)
      ORDER BY c.CreatedDate DESC
      """;

   const string Add_Sql = """
      insert into Comments (PostFk, ParentCommentFk, Title, EntryText, AuthorName, AuthorEmail, AuthorIP, CreatedDate)
      values (@PostFk, @ParentCommentFk, @Title, @EntryText, @AuthorName, @AuthorEmail, @AuthorIp, getutcdate())
      ;
      """;
}
