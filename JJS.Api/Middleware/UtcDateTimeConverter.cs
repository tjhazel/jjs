using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JJS.Api.Middleware;

public class UtcDateTimeConverter : JsonConverter<DateTime>
{
   public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
   {
      //We do not want to convert time back to local
      return DateTime.Parse(reader.GetString(), CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);
   }

   public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
   {
      //Database always stores UTC
      writer.WriteStringValue(value.ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ssZ"));
   }
}
