namespace JJS.Api.Models.CrossCountry;

public class CrossCountry
{
   public int CrossCountryId { get; set; }
   public required string RunnerName { get; set; }
   public DateTime EventDate { get; set; }
   public required string EventName { get; set; }
   public string? EventUrl { get; set; }
   public int? RunnersTime { get; set; }
   public string? Notes { get; set; }
}
