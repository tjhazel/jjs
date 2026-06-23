using JJS.Api.Models.Recipe;
using JJS.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipeController(IRecipeService recipeService) : Controller
{
   private readonly IRecipeService _recipeService = recipeService;

   [HttpGet]
   public async Task<IEnumerable<RecipeViewModel>> GetAll()
   {
      return await _recipeService.GetAll();
   }

   // Route("[action]/{recipeId}")]
   [HttpGet, Route("{recipeId}")]
   public async Task<RecipeViewModel> Get(int recipeId)
   {
      return await _recipeService.GetSingleRecipe(recipeId);
   }

   [HttpPost, HttpPut]
   public async Task<int> Post(RecipeViewModel model)
   {
      throw new NotImplementedException("Post method is not implemented yet.");
   }
}
