namespace JJS.Api.Repositories.Recipe;

public partial class IngredientRepository
{
    const string GET_ALL_SQL = """
        SELECT IngredientId, Name FROM Ingredients ORDER BY Name
        """;

    const string CREATE_SQL = """
        INSERT INTO Ingredients (Name, IngredientType) VALUES (@name, 'General');
        SELECT CAST(SCOPE_IDENTITY() AS INT);
        """;
}
