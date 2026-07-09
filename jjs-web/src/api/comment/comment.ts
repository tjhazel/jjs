export interface Comment {
   commentId: number;
   postFk: number;
   title: string;
   entryText: string;
   authorName: string;
   createdDate: string;
   adminHidden: boolean;
   hiddenBy?: string;
   hiddenDate?: string;
}

export interface NewCommentRequest {
   title: string;
   entryText: string;
}

export interface PagedComments {
   items: Comment[];
   hasMore: boolean;
}
