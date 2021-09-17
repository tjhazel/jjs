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
  prepTime: string;
  cookTime: string;
  estimatedCost: number;
  isViewableByPublic?: boolean;
  viewCount: number;  
  createdDate?: Date;
  createdByFk?: string;
  modifiedDate?: Date;
  modifiedByFk?: string;
}
 