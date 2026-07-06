using JJS.Api.Models;
using JJS.Api.Repositories;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IAttachmentService))]
public class AttachmentService(IAttachmentRepository attachmentRepository) : IAttachmentService
{
   private readonly IAttachmentRepository _attachmentRepository = attachmentRepository;

   public async Task<Attachment> Get(int attachmentId)
   {
      return await _attachmentRepository.Get(attachmentId);
   }

   public async Task<int> Save(IFormFile file)
   {
      using var ms = new MemoryStream();
      await file.CopyToAsync(ms);
      var attachment = new Attachment
      {
         Name = Path.GetFileNameWithoutExtension(file.FileName),
         FileName = file.FileName,
         FileSize = (int)file.Length,
         ContentType = file.ContentType,
         Content = ms.ToArray()
      };
      return await _attachmentRepository.Save(attachment);
   }
}

public interface IAttachmentService
{
   Task<Attachment> Get(int attachmentId);
   Task<int> Save(IFormFile file);
}
