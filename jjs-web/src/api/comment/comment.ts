export interface Comment {
   commentId: number;
   postFk: number;
   title: string;
   entryText: string;
   authorName: string;
   createdDate: string;
}

export interface NewCommentRequest {
   title: string;
   entryText: string;
}

export interface PagedComments {
   items: Comment[];
   hasMore: boolean;
}
