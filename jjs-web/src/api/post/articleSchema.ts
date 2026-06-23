import type { PostDetail } from '@api/post/post';
import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  previewText: z.string().min(1, { message: 'Preview text is required' }),
  body: z.string().min(1, { message: 'Body content is required' }),
  imageUrl: z.string().url({ message: 'Must be a valid URL' }).or(z.literal('')).optional(),
  href: z.string().url({ message: 'Must be a valid URL' }).or(z.literal('')),
  releaseDate: z.date().optional().nullable(),
  expireDate: z.date().optional().nullable(),
  categoryIds: z.array(z.number()),
  commentsEnabled: z.boolean(),
  approved: z.boolean(),
  viewCount: z.number().nonnegative(),
});

export const DEFAULT_POST: Partial<PostDetail> = {
  title: "",
  previewText: "",
  body: "",
  releaseDate: undefined,
  expireDate: undefined,
  commentsEnabled: false,
  approved: false,
  viewCount: 0,
  imageUrl: "",
  href: "",
  categoryIds: [],
  categories: [],
};

export type FormValues = z.infer<typeof articleSchema>;