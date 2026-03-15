
export const  Category_Home: number =1;

export interface Category {
  categoryId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  categoryTypeId: number;
  categoryType: string;
}
