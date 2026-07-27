namespace JJS.Api.Extensions;

public static class StringExtensions
{
   public static string? Truncate(this string? value, int maxLength) =>
      value is null || value.Length <= maxLength ? value : value[..maxLength];
}
