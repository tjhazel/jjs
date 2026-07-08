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
      order by CreatedDate asc
      ;
      """;

   const string Add_Sql = """
      insert into Comments (PostFk, Title, EntryText, AuthorName, AuthorEmail, AuthorURL, AuthorIP, CreatedDate)
      values (@PostFk, @Title, @EntryText, @AuthorName, @AuthorEmail, @AuthorUrl, @AuthorIp, getutcdate())
      ;
      """;
}
