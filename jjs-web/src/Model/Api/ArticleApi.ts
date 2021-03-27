/**
 * Manually generated from https://editor.swagger.io/#/
 * - Generate Client
 * - typescript-fetch
 */

/**
 * 
 * @export
 * @interface PostCategorySummary
 */
export interface PostCategorySummary {
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   postId?: number;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   title?: string;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   previewText?: string;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   body?: string;
   /**
    * 
    * @type {Date}
    * @memberof PostCategorySummary
    */
   releaseDate?: Date;
   /**
    * 
    * @type {Date}
    * @memberof PostCategorySummary
    */
   expireDate?: Date;
   /**
    * 
    * @type {boolean}
    * @memberof PostCategorySummary
    */
   commentsEnabled?: boolean;
   /**
    * 
    * @type {boolean}
    * @memberof PostCategorySummary
    */
   approved?: boolean;
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   viewCount?: number;
   /**
    * 
    * @type {Date}
    * @memberof PostCategorySummary
    */
   createdDate?: Date;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   createdByFk?: string;
   /**
    * 
    * @type {Date}
    * @memberof PostCategorySummary
    */
   modifiedDate?: Date;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   modifiedByFk?: string;
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   createdYear?: number;
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   createdMonth?: number;
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   createdDay?: number;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   crossPosts?: string;
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   categoryId?: number;
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   categoryTypeFk?: number;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   categoryType?: string;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   categoryTitle?: string;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   description?: string;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   imageUrl?: string;
   /**
    * 
    * @type {number}
    * @memberof PostCategorySummary
    */
   commentCount?: number;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   createdBy?: string;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
   modifiedBy?: string;
   /**
    * 
    * @type {string}
    * @memberof PostCategorySummary
    */
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