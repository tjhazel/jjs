
namespace JJS.Api.Repositories;

public partial class CategoryRepository
{
   const string GetAll_Sql = """	   
      select c.CategoryId, c.Title, c.[Description], c.ImageUrl, ct.CategoryTypeId, ct.CategoryType
      from Categories c
         left join CategoryTypes ct on ct.CategoryTypeId = c.CategoryTypeFk
      order by c.Title
      ;
      """;

}
