namespace JJS.Api.Repositories;

public partial class CommentRepository
{
   const string GetByPost_Sql = """
      select c.CommentId
         ,c.PostFk
         ,c.Title
         ,cast(c.EntryText as nvarchar(max)) 'EntryText'
         ,c.AuthorName
         ,c.CreatedDate
         ,c.AdminHidden
         ,c.HiddenBy
         ,c.HiddenDate
         ,case when @isAdmin = 1 then c.AuthorEmail else null end 'AuthorEmail'
         ,case when @isAdmin = 1 then isnull(u.Blocked, 0) else null end 'AuthorBlocked'
      from Comments c
      left join Users u on u.Email = c.AuthorEmail
      where c.PostFk = @postId
        and (@isAdmin = 1 or c.AdminHidden = 0)
      order by c.CreatedDate desc
      offset @offset rows fetch next @pageSize rows only
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

   const string Add_Sql = """
      insert into Comments (PostFk, Title, EntryText, AuthorName, AuthorEmail, AuthorIP, CreatedDate)
      values (@PostFk, @Title, @EntryText, @AuthorName, @AuthorEmail, @AuthorIp, getutcdate())
      ;
      """;
}
