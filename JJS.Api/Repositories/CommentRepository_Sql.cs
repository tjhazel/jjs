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
}
