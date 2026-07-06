
namespace JJS.Api.Repositories;

public partial class AttachmentRepository
{
   const string Get_Sql = """
      select AttachmentId, Name, FileName, FileSize, ContentType, DownloadCount, ContentType, Content
      from Attachments
      where AttachmentId = @attachmentId;
      ;
      """;

   const string Save_Sql = """
      insert into Attachments (Name, FileName, FileSize, ContentType, Content, Data)
      values (@Name, @FileName, @FileSize, @ContentType, @Content, @Content);
      select cast(scope_identity() as int);
      """;
}
