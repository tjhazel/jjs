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
}

public interface IAttachmentService
{
   Task<Attachment> Get(int attachmentId);
}
