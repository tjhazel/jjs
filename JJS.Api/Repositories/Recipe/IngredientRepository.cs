using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories.Recipe;

[ServiceImplementation(typeof(IIngredientRepository))]
public partial class IngredientRepository(AppConfig appConfig) : IIngredientRepository
{
    private readonly AppConfig _appConfig = appConfig;

    public async Task<IEnumerable<IngredientLookupViewModel>> GetAll()
    {
        await using var db = new SqlConnection(_appConfig.DbConnectionString);
        await db.OpenAsync();
        return await db.QueryAsync<IngredientLookupViewModel>(GET_ALL_SQL) ?? [];
    }

    public async Task<int> Create(string name)
    {
        await using var db = new SqlConnection(_appConfig.DbConnectionString);
        await db.OpenAsync();
        return await db.ExecuteScalarAsync<int>(CREATE_SQL, new { name });
    }
}

public interface IIngredientRepository
{
    Task<IEnumerable<IngredientLookupViewModel>> GetAll();
    Task<int> Create(string name);
}
