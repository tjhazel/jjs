namespace JJS.Api.Models.Reaction;

public class PostReactionInput
{
    public required string Emoji { get; set; }
}

public class ReactionSummary
{
    public Dictionary<string, int> Counts { get; set; } = [];
    public List<string> UserReactions { get; set; } = [];
}

internal record EmojiCount(string Emoji, int Count);
