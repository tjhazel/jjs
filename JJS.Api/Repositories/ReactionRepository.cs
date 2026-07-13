using Dapper;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Models.Reaction;
using Microsoft.Data.SqlClient;

namespace JJS.Api.Repositories;

[ServiceImplementation(typeof(IReactionRepository))]
public partial class ReactionRepository(AppConfig appConfig) : IReactionRepository
{
    private readonly AppConfig _appConfig = appConfig;

    public async Task<ReactionSummary> GetByPost(int postId, string? email)
    {
        await using var db = new SqlConnection(_appConfig.DbConnectionString);
        await db.OpenAsync();
        using var multi = await db.QueryMultipleAsync(GetByPost_Sql, new { postId, email });
        var counts = (await multi.ReadAsync<EmojiCount>()).ToDictionary(x => x.Emoji, x => x.Count);
        var userReactions = (await multi.ReadAsync<string>()).ToList();
        return new ReactionSummary { Counts = counts, UserReactions = userReactions };
    }

    public async Task Toggle(int postId, string email, string emoji)
    {
        await using var db = new SqlConnection(_appConfig.DbConnectionString);
        await db.OpenAsync();
        await db.ExecuteAsync(Toggle_Sql, new { postId, email, emoji });
    }
}

public interface IReactionRepository
{
    Task<ReactionSummary> GetByPost(int postId, string? email);
    Task Toggle(int postId, string email, string emoji);
}
