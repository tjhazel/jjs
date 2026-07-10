using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/post-image")]
public class PostImageController(IPostImageService postImageService) : ControllerBase
{
   [HttpPost]
   [Authorize(Roles = "Admin")]
   [Consumes("multipart/form-data")]
   public async Task<IActionResult> Upload(IFormFile file)
   {
      try
      {
         if (file == null || !file.ContentType.StartsWith("image/"))
            return BadRequest("An image file is required.");

         var (url, fileName) = await postImageService.Upload(file);
         return Ok(new { url, fileName });
      }
      catch (Exception ex)
      {
         return StatusCode(500, new
         {
            error = ex.Message,
            stackTrace = ex.StackTrace,
            innerError = ex.InnerException?.Message
         });
      }
   }

   [HttpGet("{fileName}")]
   public IActionResult Get(string fileName)
   {
      try
      {
         var result = postImageService.GetImage(fileName);
         if (result is null)
            return NotFound();

         var (content, contentType) = result.Value;
         return File(content, contentType);
      }
      catch (Exception ex)
      {
         return StatusCode(500, new
         {
            error = ex.Message,
            stackTrace = ex.StackTrace,
            innerError = ex.InnerException?.Message
         });
      }
   }
}
