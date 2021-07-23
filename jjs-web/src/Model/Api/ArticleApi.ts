export interface PostCategorySummary { 
   postId?: number;
   title: string;
   previewText?: string;
   body?: string;
   releaseDate?: Date;
   expireDate?: Date;
   commentsEnabled?: boolean;
   approved?: boolean;
   viewCount?: number;
   createdDate?: Date;
   createdByFk?: string;
   modifiedDate?: Date;
   modifiedByFk?: string;
   createdYear?: number;
   createdMonth?: number;
   createdDay?: number;
   crossPosts?: string;
   categoryId?: number;
   categoryTypeFk?: number;
   categoryType?: string;
   categoryTitle?: string;
   description?: string;
   imageUrl?: string;
   commentCount?: number;
   createdBy?: string;
   modifiedBy?: string;
   friendlyName?: string;
 }
 /**
 * 
 * @export
 * @interface PostCategorySummarySearch
 */
 //export interface PostCategorySummarySearch {
 //   /**
 //    * 
 //    * @type {Array<number>}
 //    * @memberof PostCategorySummarySearch
 //    */
 //   categories?: Array<number>;
 //}
 