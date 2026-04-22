

MERGE dbo.[Users] AS Target
USING (VALUES

('C00BEAFF-AF9B-4B78-9D42-4B67BE242E66', 'jertie2002@gmail.com', 'Jeri', 'Admin', 0, '2016-12-16 14:35')
,('B189EB60-B5B5-458B-B54C-B18CC35619DD', 'jhazeltine1@gmail.com', 'John', 'Admin', 0, '2016-12-16 14:35')

) AS Source (Id, [Email], [DisplayName], [Role], [IsDisabled], [LastActivityDate] )
ON (Target.Id = Source.Id)
WHEN MATCHED THEN

   UPDATE
   SET Target.[Email] = Source.[Email]
      ,Target.[DisplayName] = Source.[DisplayName]
      ,Target.[Role] = Source.[Role]
      ,Target.[IsDisabled] = Source.[IsDisabled]
      ,Target.[LastActivityDate] = Source.[LastActivityDate]

WHEN NOT MATCHED THEN

   INSERT (Id, [Email], [DisplayName], [Role], [IsDisabled], [LastActivityDate])
   VALUES (Source.Id, Source.[Email], Source.[DisplayName] ,Source.[Role], Source.[IsDisabled], Source.[LastActivityDate])
;


update RecipeInstructions
 set Instructions = dbo.[ConvertHtmlToMarkdown](instructions)
 ;

 

if col_length('dbo.Attachments', 'Content') is null
begin
    alter table Attachments
   add Content varbinary(max);
end
;

GO

update Attachments
set Content = Data
where Content is null 
;

