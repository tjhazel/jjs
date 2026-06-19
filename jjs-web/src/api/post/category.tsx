
export const  Category_Home: number = 1;
export const  Category_All: number = 6;

export interface Category {
  categoryId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  categoryTypeId: number;
  categoryType: string;
}
