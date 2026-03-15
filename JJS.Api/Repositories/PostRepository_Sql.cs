
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
}
