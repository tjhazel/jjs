using JJS.Api.Models.CrossCountry;
using JJS.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CrossCountryController(ICrossCountryService crossCountryService) : Controller
{
   private readonly ICrossCountryService _crossCountryService = crossCountryService;

   [HttpGet]
   public Task<IEnumerable<CrossCountry>> GetAll() => _crossCountryService.GetAll();

   [HttpGet("{crossCountryId:int}")]
   public async Task<ActionResult<CrossCountry>> Get(int crossCountryId)
   {
      var result = await _crossCountryService.Get(crossCountryId);
      return result is null ? NotFound() : Ok(result);
   }

   [HttpPost]
   public Task<int> Save(CrossCountry model) => _crossCountryService.Save(model);
}
