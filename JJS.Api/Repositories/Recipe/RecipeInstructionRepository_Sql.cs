
namespace JJS.Api.Repositories.Recipe;

public partial class RecipeInstructionRepository
{
   const string GetRecipeInstructions_Sql = """
       select RecipeInstructionId, Name, cast(Instructions as varchar(max)) Instruction, Sequence 
       from RecipeInstructions 
       where RecipeFk = @recipeId
       order by Sequence
      ;
      """;
}
