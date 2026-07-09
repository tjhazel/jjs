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
      from Comments
      where PostFk = @postId
      order by CreatedDate desc
      offset @offset rows fetch next @pageSize rows only
      ;
      """;

   const string Add_Sql = """
      insert into Comments (PostFk, Title, EntryText, AuthorName, AuthorEmail, AuthorIP, CreatedDate)
      values (@PostFk, @Title, @EntryText, @AuthorName, @AuthorEmail, @AuthorIp, getutcdate())
      ;
      """;
}
