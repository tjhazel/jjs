namespace JJS.Api.Repositories;

public partial class UserRepository
{
   const string GET_BY_ID_SQL = "SELECT * FROM Users WHERE Id = @id";

   const string GET_ALL_WITH_STATS_SQL = """
      SELECT
          u.Id,
          u.Email,
          u.DisplayName,
          u.Role,
          u.LastActivityDate,
          u.IsDisabled,
          u.CreatedDate,
          u.Blocked,
          u.BlockedBy,
          u.BlockedDate,
          u.BlockedReason,
          ISNULL(agg.CommentCount, 0) AS CommentCount,
          latest.LastCommentDate,
          latest.CommentId AS LastCommentId,
          latest.PostFk AS LastCommentPostId,
          p.Title AS LastCommentPostTitle
      FROM Users u
      LEFT JOIN (
          SELECT AuthorEmail, COUNT(*) AS CommentCount
          FROM Comments
          GROUP BY AuthorEmail
      ) agg ON agg.AuthorEmail = u.Email
      LEFT JOIN (
          SELECT CommentId, PostFk, AuthorEmail,
                 CreatedDate AS LastCommentDate,
                 ROW_NUMBER() OVER (PARTITION BY AuthorEmail ORDER BY CreatedDate DESC) AS rn
          FROM Comments
      ) latest ON latest.AuthorEmail = u.Email AND latest.rn = 1
      LEFT JOIN Posts p ON p.PostId = latest.PostFk
      ORDER BY u.DisplayName
      """;

   const string GET_BY_EMAIL_SQL = "SELECT * FROM Users WHERE Email = @email";

   //declare @id uniqueidentifier = newid(), @email nvarchar(256) = 'joker@email.com', @displayName nvarchar(256) = 'Joker', 
   //@role nvarchar(50) = 'joker', @lastActivityDate datetime = getutcdate(), @isDisabled bit = 0;

   const string UNBLOCK_USER_SQL = """
      UPDATE Users
      SET Blocked = 0
         ,BlockedBy = NULL
         ,BlockedDate = NULL
         ,BlockedReason = NULL
      WHERE Email = @email
      ;
      """;

   const string BLOCK_USER_SQL = """
      update Users
      set Blocked = 1
         ,BlockedBy = @blockedBy
         ,BlockedDate = getutcdate()
         ,BlockedReason = @reason
      where Email = @email
      ;
      """;

   const string MERGE_USER_SQL = """
      MERGE INTO Users AS Target
      USING(Values
         (@id, @email, @displayName, @role, @lastActivityDate, @isDisabled)
      ) AS Source(Id, [Email], [DisplayName], [Role], [LastActivityDate], [IsDisabled])
      ON(Target.Id = Source.Id)
      WHEN MATCHED THEN
         UPDATE
         SET Target.[Email] = Source.[Email]
            , Target.[DisplayName] = Source.[DisplayName]
            , Target.[Role] = Source.[Role]
            , Target.[IsDisabled] = Source.[IsDisabled]
            , Target.[LastActivityDate] = Source.[LastActivityDate]
      WHEN NOT MATCHED THEN
         INSERT ([Email], [DisplayName], [Role], [IsDisabled], [LastActivityDate])
         VALUES (Source.[Email], Source.[DisplayName], Source.[Role], Source.[IsDisabled], Source.[LastActivityDate])
      ;
      """;
}
