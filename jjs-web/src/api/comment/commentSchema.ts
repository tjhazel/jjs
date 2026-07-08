import { z } from 'zod';

export const commentSchema = z.object({
   title: z.string().min(1, { message: 'Title is required' }),
   entryText: z.string().min(1, { message: 'Comment is required' }),
});

export type CommentFormValues = z.infer<typeof commentSchema>;

export const DEFAULT_COMMENT: CommentFormValues = {
   title: '',
   entryText: '',
};
