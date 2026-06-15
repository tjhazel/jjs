namespace JJS.Api.Repositories;

public partial class UserRepository
{
   const string GET_BY_ID_SQL = "SELECT * FROM Users WHERE Id = @id";

   const string GET_BY_EMAIL_SQL = "SELECT * FROM Users WHERE Email = @email";

   //declare @id uniqueidentifier = newid(), @email nvarchar(256) = 'joker@email.com', @displayName nvarchar(256) = 'Joker', 
   //@role nvarchar(50) = 'joker', @lastActivityDate datetime = getutcdate(), @isDisabled bit = 0;

   const string MERGE_USER_SQL = """
      MERGE INTO Users AS Target
      USING(Values
         (@id, @email, @displayName, @role, @lastActivityDate, @isDisabled)
      ) AS Source(Id, [Email], [DisplayName], [Role], [IsDisabled], [LastActivityDate] )
      ON(Target.Id = Source.Id)
      WHEN MATCHED THEN
         UPDATE
         SET Target.[Email] = Source.[Email]
            , Target.[DisplayName] = Source.[DisplayName]
            , Target.[Role] = Source.[Role]
            , Target.[IsDisabled] = Source.[IsDisabled]
            , Target.[LastActivityDate] = Source.[LastActivityDate]
      WHEN NOT MATCHED THEN
         INSERT (Id, [Email], [DisplayName], [Role], [IsDisabled], [LastActivityDate])
         VALUES (Source.Id, Source.[Email], Source.[DisplayName], Source.[Role], Source.[IsDisabled], Source.[LastActivityDate])
      ;
      """;
}
