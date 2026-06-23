// src/api/recipe/recipeSchema.ts
import { z } from 'zod';

export const recipeSchema = z.object({
  name: z.string().min(1, { message: 'Recipe name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  recipeSource: z.string().or(z.literal('')),
  course: z.string().min(1, { message: 'Course classification is required' }),
  dishType: z.string().min(1, { message: 'Dish type is required' }),
  calories: z.number().nonnegative({ message: 'Calories must be a valid number' }),
  fat: z.number().nonnegative({ message: 'Fat must be a valid number' }),
  numberServed: z.number().positive({ message: 'Must serve at least 1 person' }),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  estimatedCost: z.number().nonnegative({ message: 'Cost must be a valid number' }),
  isViewableByPublic: z.boolean(),
  recipeCategoryIds: z.array(z.number()),
});


export const DEFAULT_RECIPE = {
  name: "", description: "", recipeSource: "", course: "", dishType: "",
  calories: 0, fat: 0, numberServed: 2, prepTime: "", cookTime: "",
  estimatedCost: 0.00, isViewableByPublic: false, recipeCategoryIds: [] as number[],
};