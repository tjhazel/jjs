namespace JJS.Api.Models;

public class PagedResult<T>
{
   public IEnumerable<T> Items { get; set; } = [];
   public bool HasMore { get; set; }
}
