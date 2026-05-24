"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { postSchema } from "./postSchema";
import { PostDetail } from '@/api/post/post';
import { formatDate } from "@/lib/time.functions";
import { Category } from "@/api/post/category";

// Unified wrapper component footprint deck
import { Input } from "@/components/ui/form/Input";
import { MarkdownEditor } from "@/components/ui/form/MarkdownEditor";
import { DatePicker } from "@/components/ui/form/DatePicker";
import { CheckboxList } from "@/components/ui/form/CheckboxList";

interface PostEditorProps {
   post?: PostDetail;
   categories: Category[];
   isLoading?: boolean;
   isSaving?: boolean;
   onSave: (data: PostDetail) => void;
   onCancel?: () => void;
}

const DEFAULT_POST: Partial<PostDetail> = {
   title: "",
   previewText: "",
   body: "",
   releaseDate: "",
   expireDate: "",
   commentsEnabled: false,
   approved: false,
   viewCount: 0,
   imageUrl: "",
   href: "",
   categoryIds: [],
   categories: [],
};

export default function PostEditor({
   post,
   categories = [],
   isLoading = false,
   isSaving = false,
   onSave,
   onCancel,
}: PostEditorProps) {
   const methods = useForm<PostDetail>({
      defaultValues: DEFAULT_POST as PostDetail,
      resolver: yupResolver(postSchema),
   });

   const { register, handleSubmit, reset, formState: { isDirty } } = methods;

   // Populate form when post data arrives from API
   useEffect(() => {
      if (post) reset(post);
   }, [post, reset]);

   if (isLoading) {
      return (
         <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-base-content/40" />
         </div>
      );
   }

   const isNew = !post?.postId;

   return (
      <FormProvider {...methods}>
         <form onSubmit={handleSubmit(onSave)} noValidate>
            <div className="space-y-8">

               {/* ── Section: Core content ── */}
               <section className="card bg-base-100 border border-base-200 shadow-sm">
                  <div className="card-body gap-5">
                     <h2 className="card-title text-base font-semibold">Content</h2>

                     {/* Title */}
                     <Input
                        name="title"
                        label={<>Title <span className="text-error">*</span></>}
                        placeholder="Post title"
                     />

                     {/* Preview Text */}
                     <Input
                        name="previewText"
                        label={
                           <div className="flex justify-between w-full">
                              <span>Preview Text <span className="text-error">*</span></span>
                              <span className="label-text-alt text-base-content/50 font-normal">Shown in listings</span>
                           </div>
                        }
                        variant="textarea"
                        rows={3}
                        placeholder="Short description shown in post listings…"
                     />

                     {/* Body (Markdown rendering engine) */}
                     <MarkdownEditor
                        name="body"
                        label={<>Body (Markdown supported) <span className="text-error">*</span></>}
                        rows={14}
                        placeholder="Write your full post using markdown formatting..."
                     />
                  </div>
               </section>

               {/* ── Section: Media & Links ── */}
               <section className="card bg-base-100 border border-base-200 shadow-sm">
                  <div className="card-body gap-5">
                     <h2 className="card-title text-base font-semibold">Media &amp; Links</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Image URL */}
                        <Input
                           name="imageUrl"
                           label="Image URL"
                           type="url"
                           placeholder="https://…"
                        />

                        {/* External Href */}
                        <Input
                           name="href"
                           label="External Link (href)"
                           type="url"
                           placeholder="https://…"
                        />
                     </div>
                  </div>
               </section>

               {/* ── Section: Scheduling ── */}
               <section className="card bg-base-100 border border-base-200 shadow-sm">
                  <div className="card-body gap-5">
                     <h2 className="card-title text-base font-semibold">Scheduling</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Release Date */}
                        <div>
                           <DatePicker
                              name="releaseDate"
                              label="Release Date"
                           />
                           <span className="label-text-alt text-base-content/50 block px-1 -mt-4">
                              Leave blank to publish immediately
                           </span>
                        </div>

                        {/* Expire Date */}
                        <div>
                           <DatePicker
                              name="expireDate"
                              label="Expire Date"
                           />
                           <span className="label-text-alt text-base-content/50 block px-1 -mt-4">
                              Leave blank to never expire
                           </span>
                        </div>
                     </div>
                  </div>
               </section>

               {/* ── Section: Categories ── */}
               {categories.length > 0 && (
                  <section className="card bg-base-100 border border-base-200 shadow-sm">
                     <div className="card-body gap-4">
                        <CheckboxList
                           name="categoryIds"
                           label="Categories"
                           options={categories.map((cat) => ({
                              value: cat.categoryId,
                              label: cat.title,
                           }))}
                           layoutClassName="flex flex-wrap gap-3"
                        />
                     </div>
                  </section>
               )}

               {/* ── Section: Settings ── */}
               <section className="card bg-base-100 border border-base-200 shadow-sm">
                  <div className="card-body gap-5">
                     <h2 className="card-title text-base font-semibold">Settings</h2>
                     <div className="flex flex-col sm:flex-row gap-6">

                        {/* Approved Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                           <input type="checkbox" className="toggle toggle-success" {...register("approved")} />
                           <div>
                              <p className="text-sm font-medium text-base-content">Approved</p>
                              <p className="text-xs text-base-content/50">Visible to the public</p>
                           </div>
                        </label>

                        {/* Comments Enabled Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                           <input type="checkbox" className="toggle" {...register("commentsEnabled")} />
                           <div>
                              <p className="text-sm font-medium text-base-content">Comments Enabled</p>
                              <p className="text-xs text-base-content/50">Allow readers to comment</p>
                           </div>
                        </label>
                     </div>

                     {/* View Count (Read-only wrapper execution) */}
                     <div className="max-w-xs">
                        <Input
                           name="viewCount"
                           label={
                              <div className="flex justify-between w-full">
                                 <span>View Count</span>
                                 <span className="label-text-alt text-base-content/50 font-normal">Read-only</span>
                              </div>
                           }
                           type="number"
                           className="bg-base-200 cursor-not-allowed rounded-lg"
                           disabled={true}
                        />
                     </div>
                  </div>
               </section>

               {/* ── Section: Audit (Read-only summary layout) ── */}
               {!isNew && (
                  <section className="card bg-base-100 border border-base-200 shadow-sm">
                     <div className="card-body gap-4">
                        <h2 className="card-title text-base font-semibold">Audit</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                           <div>
                              <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-1">Created</p>
                              <p className="text-base-content">{post?.createdBy}</p>
                              <p className="text-base-content/60 text-xs">{post?.createdDate ? formatDate(post.createdDate) : "—"}</p>
                           </div>
                           <div>
                              <p className="text-xs font-medium text-base-content/50 uppercase tracking-wide mb-1">Last Modified</p>
                              <p className="text-base-content">{post?.modifiedBy}</p>
                              <p className="text-base-content/60 text-xs">{post?.modifiedDate ? formatDate(post.modifiedDate) : "—"}</p>
                           </div>
                        </div>
                     </div>
                  </section>
               )}

               {/* ── Actions Footer Segment ── */}
               <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-3">
                     <button type="submit" disabled={isSaving || !isDirty} className="btn btn-neutral">
                        {isSaving && <span className="loading loading-spinner loading-sm" />}
                        {isSaving ? "Saving…" : isNew ? "Create Post" : "Save Changes"}
                     </button>

                     {onCancel && (
                        <button type="button" className="btn btn-ghost" onClick={onCancel}>
                           Cancel
                        </button>
                     )}
                  </div>

                  {!isNew && (
                     <span className="text-xs text-base-content/40 font-mono">ID: {post?.postId}</span>
                  )}
               </div>

            </div>
         </form>
      </FormProvider>
   );
}
