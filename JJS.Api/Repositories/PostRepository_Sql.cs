
namespace JJS.Api.Repositories;

public partial class PostRepository
{
   const string GetAll_Posts = """
	   select p.PostId
	   	,p.Title
	   	,p.PreviewText
	   	,cast(p.Body as varchar(max)) 'Body' 
	   	,p.CreatedDate
	   	,u.DisplayName
	   	,p.ViewCount
	   	,string_agg(c.Title, ',') 'Categories'
	   from Posts p 
	   	left join PostCategories pc on pc.PostFk = p.PostId
	   	left join Categories c on c.CategoryId = pc.CategoryFk
	   	left join Users u on u.Id = p.CreatedByFk
	   group by p.PostId
	   	,p.Title
	   	,p.PreviewText
	   	,cast(p.Body as varchar(max))
	   	,p.CreatedDate 
	   	,u.DisplayName
	   	,p.ViewCount
	   """;

}
