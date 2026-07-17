namespace JJS.Api.Models.Comment;

public class ModerationResult
{
   public bool IsSpam { get; set; }
   public bool IsToxic { get; set; }
   public string Reason { get; set; } = string.Empty;

   public bool IsFlagged => IsSpam || IsToxic;
   public bool WasProcessed { get; set; }
}
