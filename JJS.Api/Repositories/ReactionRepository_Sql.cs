namespace JJS.Api.Repositories;

public partial class ReactionRepository
{
    const string GetByPost_Sql = """
        SELECT Emoji COLLATE Latin1_General_100_BIN2 AS Emoji, COUNT(*) AS Count
        FROM PostReactions
        WHERE PostFk = @postId
        GROUP BY Emoji COLLATE Latin1_General_100_BIN2
        ;
        SELECT Emoji COLLATE Latin1_General_100_BIN2 AS Emoji
        FROM PostReactions
        WHERE PostFk = @postId AND (@email IS NOT NULL AND Email = @email)
        ;
        """;

    const string Toggle_Sql = """
        IF EXISTS (
            SELECT 1 FROM PostReactions
            WHERE PostFk = @postId AND Email = @email AND Emoji COLLATE Latin1_General_100_BIN2 = @emoji COLLATE Latin1_General_100_BIN2
        )
            DELETE FROM PostReactions
            WHERE PostFk = @postId AND Email = @email AND Emoji COLLATE Latin1_General_100_BIN2 = @emoji COLLATE Latin1_General_100_BIN2
        ELSE
            INSERT INTO PostReactions (PostFk, Email, Emoji, ReactedAt)
            VALUES (@postId, @email, @emoji, GETUTCDATE())
        ;
        """;

    const string GetByComment_Sql = """
        SELECT Emoji COLLATE Latin1_General_100_BIN2 AS Emoji, COUNT(*) AS Count
        FROM CommentReactions
        WHERE CommentFk = @commentId
        GROUP BY Emoji COLLATE Latin1_General_100_BIN2
        ;
        SELECT Emoji COLLATE Latin1_General_100_BIN2 AS Emoji
        FROM CommentReactions
        WHERE CommentFk = @commentId AND (@email IS NOT NULL AND Email = @email)
        ;
        """;

    const string ToggleComment_Sql = """
        IF EXISTS (
            SELECT 1 FROM CommentReactions
            WHERE CommentFk = @commentId AND Email = @email AND Emoji COLLATE Latin1_General_100_BIN2 = @emoji COLLATE Latin1_General_100_BIN2
        )
            DELETE FROM CommentReactions
            WHERE CommentFk = @commentId AND Email = @email AND Emoji COLLATE Latin1_General_100_BIN2 = @emoji COLLATE Latin1_General_100_BIN2
        ELSE
            INSERT INTO CommentReactions (CommentFk, Email, Emoji, ReactedAt)
            VALUES (@commentId, @email, @emoji, GETUTCDATE())
        ;
        """;
}
