
namespace JJS.Api.Repositories;

public partial class AttachmentRepository
{
   const string Get_Sql = """
      select AttachmentId, Name, FileName, FileSize, ContentType, DownloadCount, ContentType, Content
      from Attachments
      where AttachmentId = @attachmentId;
      ;
      """;

}
