namespace JJS.Api.Repositories.Recipe;

public partial class UnitOfMeasureRepository
{
    const string GET_ALL_SQL = """
        SELECT UnitOfMeasureId, Name, PluralName FROM UnitOfMeasure ORDER BY Name
        """;
}
