
namespace JJS.Api.Repositories;

public partial class CategoryRepository
{
   const string GetAll_Sql = """
      select c.CategoryId, c.Title, c.[Description], c.ImageUrl, ct.CategoryTypeId, ct.CategoryType
      from Categories c
         join CategoryTypes ct on ct.CategoryTypeId = c.CategoryTypeFk
      where c.CategoryTypeFk = isnull(@categoryTypeId, c.CategoryTypeFk)
      order by c.Title
      ;
      """;

}
