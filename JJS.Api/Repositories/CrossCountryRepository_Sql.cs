namespace JJS.Api.Repositories;

public partial class CrossCountryRepository
{
   private const string GetAll_Sql = """
      select CrossCountryId, RunnerName, EventDate, EventName, EventUrl, RunnersTime, Notes
      from dbo.CrossCountry
      order by EventDate desc, RunnerName;
      """;

   private const string Get_Sql = """
      select CrossCountryId, RunnerName, EventDate, EventName, EventUrl, RunnersTime, Notes
      from dbo.CrossCountry
      where CrossCountryId = @crossCountryId;
      """;

   private const string Save_Sql = """
      merge dbo.CrossCountry as target
      using (values (@CrossCountryId, @RunnerName, @EventDate, @EventName, @EventUrl, @RunnersTime, @Notes))
         as source (CrossCountryId, RunnerName, EventDate, EventName, EventUrl, RunnersTime, Notes)
      on target.CrossCountryId = source.CrossCountryId
      when matched then update set
         RunnerName = source.RunnerName,
         EventDate = source.EventDate,
         EventName = source.EventName,
         EventUrl = source.EventUrl,
         RunnersTime = source.RunnersTime,
         Notes = source.Notes
      when not matched then insert
         (RunnerName, EventDate, EventName, EventUrl, RunnersTime, Notes)
         values (source.RunnerName, source.EventDate, source.EventName, source.EventUrl, source.RunnersTime, source.Notes)
      output inserted.CrossCountryId;
      """;
}
