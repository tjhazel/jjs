using JJS.Api.Models;
using JJS.Api.Models.Recipe;
using JJS.Api.Repositories;
using JJS.Api.Repositories.Recipe;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IRecipeService))]
public class RecipeService(IRecipeRepository recipeRepository,
   IRecipeCategoryRepository recipeCategoryRepository,
   IRecipeIngredientRepository recipeIngredientRepository,
    IRecipeInstructionRepository recipeInstructionRepository) : IRecipeService
{
   private readonly IRecipeRepository _recipeRepository = recipeRepository;
   private readonly IRecipeCategoryRepository _recipeCategoryRepository = recipeCategoryRepository;
   private readonly IRecipeIngredientRepository _recipeIngredientRepository = recipeIngredientRepository;
   private readonly IRecipeInstructionRepository _recipeInstructionRepository = recipeInstructionRepository;

   public async Task<IEnumerable<RecipeViewModel>> GetAll()
   {
      return await _recipeRepository.GetRecipes();
   }

   public async Task<RecipeDetailViewModel> GetSingleRecipe(int recipeId)
   {
      var recipe = await _recipeRepository.GetRecipe(recipeId);

      ArgumentNullException.ThrowIfNull(recipe, nameof(recipe));

      recipe.Ingredients = await _recipeIngredientRepository.GetRecipeIngredients(recipeId);
      recipe.Instructions = await _recipeInstructionRepository.GetRecipeInstructions(recipeId);
      return recipe;
   }

   public async Task<IEnumerable<RecipeCategory>> GetRecipeCategories()
   {
      return await _recipeCategoryRepository.GetAll();
   }
}

public interface IRecipeService
{
   Task<IEnumerable<RecipeViewModel>> GetAll();
   Task<RecipeDetailViewModel> GetSingleRecipe(int recipeId);
   Task<IEnumerable<RecipeCategory>> GetRecipeCategories();
}
