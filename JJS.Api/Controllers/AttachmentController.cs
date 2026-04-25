using JJS.Api.Models;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class AttachmentController(IAttachmentService attachmentService) : Controller
{
   private readonly IAttachmentService _attachmentService = attachmentService;

   // Route("[action]/{recipeId}")]
   [HttpGet, Route("{attachmentId}")]
   public async Task<Attachment> Get(int attachmentId)
   {
      return await _attachmentService.Get(attachmentId);
   }
}
