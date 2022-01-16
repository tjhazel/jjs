import { stringComparer, numberComparer, dateComparer, boolComparer } from '../comparer.functions';

export interface PostCategorySummary {
   postId?: number;
   title: string;
   previewText: string;
   body: string;
   releaseDate?: Date;
   expireDate?: Date;
   commentsEnabled: boolean;
   approved: boolean;
   viewCount: number;
   createdDate: Date;
   createdByFk: number;
   modifiedDate: Date;
   modifiedByFk: number;
   createdYear: number;
   createdMonth: number;
   createdDay: number;
   crossPosts: string;
   categoryId: number;
   categoryTypeFk: number;
   categoryType: string;
   categoryTitle: string;
   description: string;
   imageUrl: string;
   commentCount: number;
   createdBy: string;
   modifiedBy: string;
   friendlyName: string;
 }
 
 export interface Post { 
  postId?: number;
  title: string;
  previewText: string;
  body: string;
  releaseDate?: Date;
  expireDate?: Date;
  commentsEnabled?: boolean;
  approved?: boolean;
  viewCount?: number;
  createdDate?: Date;
  createdByFk: string;
  modifiedDate?: Date;
  modifiedByFk?: string;
  
  categories: Category[];
}

export interface Category { 
  categoryId: number;
  categoryTypeFk: number;
  title: string;
  description: string;
  ImageUrl: string;
  createdDate?: Date;
  createdByFk?: number;
  modifiedDate?: Date;
  modifiedByFk?: number;  
}

export const sortPostCategorySummary = (
   state: PostCategorySummary[],
   sortField: string,
   sortDirection: string
): PostCategorySummary[] =>
   state.sort((a: PostCategorySummary, b: PostCategorySummary) => {
      return compare(a, b, sortField, sortDirection);
   });
;


//Method used to provide compare function for use with full app.
export const compare = (
   a: PostCategorySummary, b: PostCategorySummary, sortField: string, sortDirection: string
): number => {

   let sortValue: number;

   switch (sortField) {
      case "title":
         sortValue = stringComparer(a.title, b.title);
         break;
      case "viewCount":
         sortValue = numberComparer(a.viewCount, b.viewCount);
         break;
      case "createdDate":
         sortValue = dateComparer(a.createdDate, b.createdDate);
         break;
      case "categoryTitle":
         sortValue = stringComparer(a.categoryTitle, b.categoryTitle);
         break;
      default:
         sortValue = stringComparer(a.title, b.title);
   }

   return sortDirection === 'ascending' ? sortValue : sortValue * -1;
};
