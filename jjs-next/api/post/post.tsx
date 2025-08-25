export interface Post {
  postId: number | string;
  title: string;
  previewText: string;
  body: string;
  createdDate: string; // ISO string or date-like
  createdBy: string;
  viewCount: number;
  categories: string[];
  imageSrc?: string;
  href?: string;
}
