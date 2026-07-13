namespace JJS.Api.Repositories;

public partial class ReactionRepository
{
    const string GetByPost_Sql = """
        SELECT Emoji, COUNT(*) AS Count
        FROM PostReactions
        WHERE PostFk = @postId
        GROUP BY Emoji
        ;
        SELECT Emoji
        FROM PostReactions
        WHERE PostFk = @postId AND (@email IS NOT NULL AND Email = @email)
        ;
        """;

    const string Toggle_Sql = """
        IF EXISTS (
            SELECT 1 FROM PostReactions
            WHERE PostFk = @postId AND Email = @email AND Emoji = @emoji
        )
            DELETE FROM PostReactions
            WHERE PostFk = @postId AND Email = @email AND Emoji = @emoji
        ELSE
            INSERT INTO PostReactions (PostFk, Email, Emoji, ReactedAt)
            VALUES (@postId, @email, @emoji, GETUTCDATE())
        ;
        """;

    const string GetByComment_Sql = """
        SELECT Emoji, COUNT(*) AS Count
        FROM CommentReactions
        WHERE CommentFk = @commentId
        GROUP BY Emoji
        ;
        SELECT Emoji
        FROM CommentReactions
        WHERE CommentFk = @commentId AND (@email IS NOT NULL AND Email = @email)
        ;
        """;

    const string ToggleComment_Sql = """
        IF EXISTS (
            SELECT 1 FROM CommentReactions
            WHERE CommentFk = @commentId AND Email = @email AND Emoji = @emoji
        )
            DELETE FROM CommentReactions
            WHERE CommentFk = @commentId AND Email = @email AND Emoji = @emoji
        ELSE
            INSERT INTO CommentReactions (CommentFk, Email, Emoji, ReactedAt)
            VALUES (@commentId, @email, @emoji, GETUTCDATE())
        ;
        """;
}
