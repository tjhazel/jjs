
namespace JJS.Api.Repositories;

public partial class AttachmentRepository
{
   const string Get_Sql = """
      select AttachmentId, Name, FileName, FileSize, ContentType, DownloadCount, ContentType, Content
      from Attachments
      where AttachmentId = @attachmentId;
      ;
      """;

   const string GetByName_Sql = """
      select AttachmentId, Name, FileName, FileSize, ContentType, DownloadCount, Content
      from Attachments
      where Name = @name;
      """;

   const string Save_Sql = """
      insert into Attachments (Name, FileName, FileSize, ContentType, Content, Data)
      values (@Name, @FileName, @FileSize, @ContentType, @Content, @Content);
      select cast(scope_identity() as int);
      """;

   const string Upsert_Sql = """
      merge Attachments as target
      using (select @Name as Name) as source
         on target.Name = source.Name
      when matched then
         update set Content = @Content, Data = @Content, FileSize = @FileSize
      when not matched then
         insert (Name, FileName, FileSize, ContentType, Content, Data)
         values (@Name, @FileName, @FileSize, @ContentType, @Content, @Content);
      """;
}
