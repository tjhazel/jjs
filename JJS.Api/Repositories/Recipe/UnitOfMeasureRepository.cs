using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Recipe;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories.Recipe;

[ServiceImplementation(typeof(IUnitOfMeasureRepository))]
public partial class UnitOfMeasureRepository(AppConfig appConfig) : IUnitOfMeasureRepository
{
    private readonly AppConfig _appConfig = appConfig;

    public async Task<IEnumerable<UnitOfMeasureViewModel>> GetAll()
    {
        await using var db = new SqlConnection(_appConfig.DbConnectionString);
        await db.OpenAsync();
        return await db.QueryAsync<UnitOfMeasureViewModel>(GET_ALL_SQL) ?? [];
    }
}

public interface IUnitOfMeasureRepository
{
    Task<IEnumerable<UnitOfMeasureViewModel>> GetAll();
}
