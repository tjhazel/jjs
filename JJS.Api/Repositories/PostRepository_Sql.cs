
namespace JJS.Api.Repositories;

public partial class PostRepository
{
   const string GetAll_Posts = """	   
	   ;with bcte as (
	   	select PostId 
	   		,cast(Body as varchar(max)) 'Body'
	   		from Posts
	   )
	   select p.PostId
	    	,p.Title
	    	,p.PreviewText
	    	,b.Body
	    	,p.CreatedDate
	    	,u.DisplayName 'CreatedBy'
	    	,p.ViewCount
	   	,b.ImageUrl
	    	,string_agg(c.Title, ',') 'Categories'
	    from Posts p 
	   	join (
	   		select PostId 
	   			,Body
	   			--,LEFT(Body, CHARINDEX(':', '.jpg') - 1) 'Image'
	   			,null 'ImageUrl'
	   		from bcte
	   	) b on b.PostId = p.PostId
	    	left join PostCategories pc on pc.PostFk = p.PostId
	    	left join Categories c on c.CategoryId = pc.CategoryFk
	    	left join Users u on u.Id = p.CreatedByFk
	    group by p.PostId
	    	,p.Title
	    	,p.PreviewText
	    	,b.Body
	    	,p.CreatedDate 
	    	,u.DisplayName
	    	,p.ViewCount
	   	,b.ImageUrl
	   """;

}
