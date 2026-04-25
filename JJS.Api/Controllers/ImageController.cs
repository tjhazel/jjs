using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;
namespace JJS.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ImageController(IHttpContextAccessor _httpContextAccessor,
   IAlbumService _albumService) : ControllerBase
{
   [HttpGet, Route("{path=path}")]
   public IActionResult Get(string path)
   {
      var newpath = path;

      var relativeUrl = Microsoft.AspNetCore.Http.Extensions.UriHelper.GetEncodedPathAndQuery(_httpContextAccessor.HttpContext.Request);
      var minusCtrlPath = relativeUrl.Replace("Image","");
      var fullPath = _albumService.GetFullFilePath(minusCtrlPath);

      var contentType = _albumService.GetContentType(fullPath);
      var image = System.IO.File.OpenRead(fullPath);
     
      return File(image, contentType);
   }

}
