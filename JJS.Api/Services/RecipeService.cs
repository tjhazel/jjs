using JJS.Api.Models;
using JJS.Api.Models.Recipe;
using JJS.Api.Repositories;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IRecipeService))]
public class RecipeService(IRecipeRepository recipeRepository,
   IRecipeCategoryRepository recipeCategoryRepository) : IRecipeService
{
   private readonly IRecipeRepository _recipeRepository = recipeRepository;
   private readonly IRecipeCategoryRepository _recipeCategoryRepository = recipeCategoryRepository;

   public async Task<IEnumerable<RecipeViewModel>> GetAll()
   {
      return await _recipeRepository.GetAll();
   }

   public async Task<IEnumerable<RecipeCategory>> GetRecipeCategories()
   {
      return await _recipeCategoryRepository.GetAll();
   }
}

public interface IRecipeService
{
   Task<IEnumerable<RecipeViewModel>> GetAll();
   Task<IEnumerable<RecipeCategory>> GetRecipeCategories();
}
