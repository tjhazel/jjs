export interface Post {
  postId?: number;
  title: string;
  previewText: string;
  body: string;
  releaseDate?: string;
  expireDate?: string;
  commentsEnabled : boolean;
  approved  : boolean;
  viewCount: number;
  createdDate: string; // ISO string or date-like
  createdByFk: string;
  createdBy: string;
  modifiedDate : string; // ISO string or date-like
  modifiedByFk : string;
  modifiedBy : string;

  imageUrl?: string;
  href?: string;
  categoryIds: number[];
  categories: string[];
}
