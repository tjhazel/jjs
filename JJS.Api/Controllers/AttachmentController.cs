using JJS.Api.Models;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttachmentController(IAttachmentService attachmentService) : Controller
{
   private readonly IAttachmentService _attachmentService = attachmentService;

   [HttpGet, Route("{attachmentId}")]
   public async Task<Attachment> Get(int attachmentId)
   {
      return await _attachmentService.Get(attachmentId);
   }

   [HttpGet, Route("{attachmentId}/content")]
   public async Task<IActionResult> Content(int attachmentId)
   {
      var attachment = await _attachmentService.Get(attachmentId);
      if (attachment?.Content == null)
         return NotFound();
      return File(attachment.Content, attachment.ContentType);
   }

   [HttpPost]
   [Authorize(Roles = "Admin")]
   [Consumes("multipart/form-data")]
   public async Task<IActionResult> Upload(IFormFile file)
   {
      if (file == null || !file.ContentType.StartsWith("image/"))
         return BadRequest("An image file is required.");

      var attachmentId = await _attachmentService.Save(file);
      return Ok(new { attachmentId, file.FileName });
   }
}
