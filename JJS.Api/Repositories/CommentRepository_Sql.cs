namespace JJS.Api.Repositories;

public partial class CommentRepository
{
   const string GetByPost_Sql = """
      select CommentId
         ,PostFk
         ,Title
         ,cast(EntryText as nvarchar(max)) 'EntryText'
         ,AuthorName
         ,CreatedDate
         ,AdminHidden
         ,HiddenBy
         ,HiddenDate
      from Comments
      where PostFk = @postId
        and (@isAdmin = 1 or AdminHidden = 0)
      order by CreatedDate desc
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
