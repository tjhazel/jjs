using JJS.Api.Models.Album;
using JJS.Api.Models.Post;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlbumController(IAlbumService albumService) : Controller
{
   private readonly IAlbumService _albumService = albumService;

   [HttpGet]
   public async Task<Folder> Get()
   {
      return await _albumService.Get();
   }
}
