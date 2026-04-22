namespace JJS.Api.Models.Recipe;

public class InstructionViewModel
{
   public int RecipeInstructionId { get; set; }
   public required string Name { get; set; }
   public string? Instruction { get; set; }
   public int Sequence { get; set; }
}
