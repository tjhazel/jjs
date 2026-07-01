using JJS.Api.Models;
using JJS.Api.Models.People;
using JJS.Api.Models.Recipe;
using JJS.Api.Repositories;
using JJS.Api.Repositories.Recipe;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(IRecipeService))]
public class RecipeService(IRecipeRepository recipeRepository,
   IRecipeCategoryRepository recipeCategoryRepository,
   IRecipeIngredientRepository recipeIngredientRepository,
   IRecipeInstructionRepository recipeInstructionRepository,
   IAttachmentService attachmentService,
   IUserService userService) : IRecipeService
{
   private readonly IRecipeRepository _recipeRepository = recipeRepository;
   private readonly IRecipeCategoryRepository _recipeCategoryRepository = recipeCategoryRepository;
   private readonly IRecipeIngredientRepository _recipeIngredientRepository = recipeIngredientRepository;
   private readonly IRecipeInstructionRepository _recipeInstructionRepository = recipeInstructionRepository;
   private readonly IAttachmentService _attachmentService = attachmentService;
   private readonly IUserService _userService = userService;

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

      if (recipe.PictureFk.HasValue)
      {
         var attachment = await _attachmentService.Get(recipe.PictureFk.Value);
         if (attachment != null)
         {
            recipe.Picture = AttachmentViewModel.FromAttachment(attachment);
         }
      }
      return recipe;
   }

   public async Task<IEnumerable<RecipeCategory>> GetRecipeCategories()
   {
      return await _recipeCategoryRepository.GetAll();
   }

   public async Task<int> Save(RecipeDetailViewModel model, ClaimsUser user)
   {
      var existingUser = await _userService.Get(user.Email);

      if (model.RecipeId == 0)
      {
         model.CreatedDate = DateTime.UtcNow;
         model.CreatedByFk = existingUser!.Id;
      }
      model.ModifiedDate = DateTime.UtcNow;
      model.ModifiedByFk = existingUser!.Id;

      var recipeId = await _recipeRepository.Save(model);

      await _recipeIngredientRepository.SaveIngredients(recipeId, model.Ingredients);
      await _recipeInstructionRepository.SaveInstructions(recipeId, model.Instructions);
      await _recipeCategoryRepository.SyncCategories(recipeId, model.RecipeCategoryIds);

      return recipeId;
   }
}

public interface IRecipeService
{
   Task<IEnumerable<RecipeViewModel>> GetAll();
   Task<RecipeDetailViewModel> GetSingleRecipe(int recipeId);
   Task<IEnumerable<RecipeCategory>> GetRecipeCategories();
   Task<int> Save(RecipeDetailViewModel model, ClaimsUser user);
}
