export interface Post {
  postId?: number;
  title: string;
  previewText: string;
  body: string;
  releaseDate?: Date;
  expireDate?: Date;
  commentsEnabled : boolean;
  approved  : boolean;
  viewCount: number;
  createdDate?: Date; 
  createdByFk?: string;
  modifiedDate? : Date; 
  modifiedByFk? : string;
}

export interface PostDetail extends Post {
   createdBy?: string;
   modifiedBy?: string;

   imageUrl?: string;
   categoryIds: number[];
   categories?: string[];
}
