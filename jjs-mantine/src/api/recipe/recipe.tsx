// add near top of `jjs-web\api\recipe\recipe.tsx`
import type { AttachmentViewModel } from "@/api/attachment/attachment-models"; 

export interface Recipe {
   recipeId?: number;
   name: string;
   description: string;
   recipeSource: string;
   course: string;
   dishType: string;
   calories: number;
   fat: number;
   numberServed: number;
   prepTime?: string;
   cookTime?: string;
   estimatedCost: number;
   pictureFk: number;
   isViewableByPublic: boolean;
   viewCount: number;
   createdDate: string; // ISO string or date-like
   createdByFk: string;
   createdBy: string;
   modifiedDate: string; // ISO string or date-like
   modifiedByFk: string;
   modifiedBy: string;

   recipeCategoryIds: number[];
   recipeCategories: string[];
}

export interface RecipeDetail extends Recipe {
   ingredients: Ingredient[];
   instructions: Instruction[];
   picture: AttachmentViewModel | null;
}

export interface Ingredient {
  ingredientsXrefId?: number;
  ingredientFk: number;
  amount: number;
  unitOfMeasure: string;
  ingredient: string;
  description: string;
  sequence: number;
}

export interface Instruction {
  recipeInstructionId?: number;
  name: string;
  instruction: string;
  sequence: number;
}