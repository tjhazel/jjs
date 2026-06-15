import * as yup from "yup";

export const postSchema = yup.object({
   title: yup
      .string()
      .required("Title is required")
      .max(100, "Title cannot exceed 100 characters"),

   previewText: yup
      .string()
      .required("Preview text is required")
      .max(300, "Preview text cannot exceed 300 characters"),

   body: yup
      .string()
      .required("Body content is required"),

   // Fixed: Added .optional() to match the optional PostDetail parameters
   imageUrl: yup
      .string()
      .transform((value) => (value === "" ? undefined : value))
      .url("Must be a valid URL starting with http:// or https://")
      .optional(),

   // Fixed: Added .optional() to match the optional PostDetail parameters
   href: yup
      .string()
      .transform((value) => (value === "" ? undefined : value))
      .url("Must be a valid URL starting with http:// or https://")
      .optional(),

   // Fixed: Mark dates and lists as optional if they are not strictly required on new posts
   releaseDate: yup.string().optional(),
   expireDate: yup.string().optional(),
   categoryIds: yup.array().of(yup.number()).optional(),

   approved: yup.boolean().default(false),
   commentsEnabled: yup.boolean().default(false),
   viewCount: yup.number().integer().default(0),
}).required();
