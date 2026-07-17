export interface Comment {
   commentId: number;
   postFk: number;
   title?: string;
   entryText: string;
   authorName: string;
   createdDate: string;
   adminHidden: boolean;
   screenedBy?: string;
   hiddenDate?: string;
   screenResult?: string;
   authorEmail?: string;
   authorBlocked?: boolean;
   parentCommentFk?: number;
   replyCount: number;
   reactionCounts?: string;
}

export interface CommentSummary extends Comment {
   postTitle: string;
}

export interface NewCommentRequest {
   title?: string;
   entryText: string;
   parentCommentFk?: number;
}

export interface PagedComments {
   items: Comment[];
   hasMore: boolean;
}
