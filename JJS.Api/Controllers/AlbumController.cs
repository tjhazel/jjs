using JJS.Api.Models.Article.ViewModel;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using JJS.Api.Extensions;
using JJS.Api.Models.Album;

namespace JJS.Api.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class AlbumController : ControllerBase
   {
      private readonly AlbumService _albumService;

      public AlbumController(AlbumService albumService)
      {
         _albumService = albumService;
      }

      [HttpGet]
      [Route("[action]")]
      public Folder Get()
      {
         return _albumService.Get();
      }
   }
}
