using JJS.Api.Models.Recipe;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class RecipeController(IRecipeService recipeService) : Controller
{
   private readonly IRecipeService _recipeService = recipeService;

   [HttpGet]
   public async Task<IEnumerable<RecipeViewModel>> GetAll()
   {
      return await _recipeService.GetAll();
   }
}
