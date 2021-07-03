using System;

namespace JJS.Api.Extensions
{
   public static class DateExtensions
   {
      public static string ToUtcString(this DateTime date)
      {
         return date.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ssZ");
      }
   }
}
