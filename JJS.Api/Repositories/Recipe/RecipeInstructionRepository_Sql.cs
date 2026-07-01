
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

   const string MERGE_SQL = """
      MERGE [RecipeInstructions] AS TARGET
      USING (
         VALUES (@RecipeInstructionId
            ,@RecipeFk
            ,@Name
            ,@Instruction
            ,@Sequence)
      ) AS SOURCE (RecipeInstructionId
            ,RecipeFk
            ,[Name]
            ,Instructions
            ,Sequence)
      ON SOURCE.RecipeInstructionId = TARGET.RecipeInstructionId
      WHEN MATCHED THEN
         UPDATE SET
             RecipeFk     = SOURCE.RecipeFk
            ,[Name]       = SOURCE.[Name]
            ,Instructions = SOURCE.Instructions
            ,Sequence     = SOURCE.Sequence
      WHEN NOT MATCHED BY TARGET THEN
         INSERT (RecipeFk
            ,[Name]
            ,Instructions
            ,Sequence)
         VALUES (SOURCE.RecipeFk
            ,SOURCE.[Name]
            ,SOURCE.Instructions
            ,SOURCE.Sequence)
      OUTPUT inserted.RecipeInstructionId
      ;
      """;

   const string DELETE_BY_RECIPE_SQL = """
      DELETE FROM [RecipeInstructions] WHERE RecipeFk = @recipeId AND RecipeInstructionId NOT IN @keepIds;
      """;
}
