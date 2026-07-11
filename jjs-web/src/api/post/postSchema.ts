import { z } from 'zod';

// FIX: Added coercion so Zod converts string timestamps into proper Date objects
const optionalFormDate = z.preprocess((val) => {
   if (val === '' || val === null || val === undefined) return null;
   return val;
}, z.coerce.date().nullable().optional()); // Coerces raw strings directly to Date

const basePostSchema = z.object({
   postId: z.number().optional(),
   title: z.string().min(1, { message: 'Title is required' }),
   previewText: z.string().min(1, { message: 'Preview text is required' }),
   body: z.string().min(1, { message: 'Body content is required' }),
   releaseDate: optionalFormDate,
   expireDate: optionalFormDate,
   commentsEnabled: z.boolean(),
   approved: z.boolean(),
   archived: z.boolean().nullable().optional(),
   circleOfTrust: z.boolean().nullable().optional(),
   viewCount: z.number().nonnegative()
});

// use .extend() to add or override properties for your UI form state
export const postSchema = basePostSchema.extend({
   imageUrl: z.string()
      .refine(
         val => val === '' || val.startsWith('/') || z.string().url().safeParse(val).success,
         { message: 'Must be a valid URL or a local image path starting with /' }
      )
      .optional(),

   // UI layer tracks categories as strings for Mantine's Checkbox.Group compatibility
   categoryIds: z.array(z.string()),
});

export const DEFAULT_POST: FormValues = {
   title: "",
   previewText: "",
   body: "",
   releaseDate: null,
   expireDate: null,
   commentsEnabled: false,
   approved: false,
   archived: null,
   circleOfTrust: null,
   viewCount: 0,
   imageUrl: "",
   categoryIds: [], // Empty string array to prevent Mantine rendering errors
};

export type FormValues = z.infer<typeof postSchema>;
