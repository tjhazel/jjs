// src/components/admin/articleSchema.ts
import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  previewText: z.string().min(1, { message: 'Preview text is required' }),
  body: z.string().min(1, { message: 'Body content is required' }),
  imageUrl: z.string().url({ message: 'Must be a valid URL' }).or(z.literal('')).optional(),
  href: z.string().url({ message: 'Must be a valid URL' }).or(z.literal('')),
  releaseDate: z.string().optional(),
  expireDate: z.string().optional(),
  categoryIds: z.array(z.number()),
  commentsEnabled: z.boolean(),
  approved: z.boolean(),
  viewCount: z.number().nonnegative(),
});
