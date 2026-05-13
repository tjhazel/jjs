"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { PostDetail } from '@/api/post/post';
import { formatDate } from "@/lib/time.functions";

interface Category {
   categoryId: number;
   name: string;
}

interface PostEditorProps {
   post?: PostDetail;
   categories?: Category[];
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
   const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors, isDirty },
   } = useForm<PostDetail>({
      defaultValues: DEFAULT_POST as PostDetail,
   });

   // Populate form when post data arrives
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
      <form onSubmit={handleSubmit(onSave)} noValidate>
         <div className="space-y-8">

            {/* ── Section: Core content ── */}
            <section className="card bg-base-100 border border-base-200 shadow-sm">
               <div className="card-body gap-5">
                  <h2 className="card-title text-base font-semibold">Content</h2>

                  {/* Title */}
                  <div className="form-control">
                     <label className="label" htmlFor="title">
                        <span className="label-text font-medium">Title <span className="text-error">*</span></span>
                     </label>
                     <input
                        id="title"
                        type="text"
                        placeholder="Post title"
                        className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
                        {...register("title", { required: "Title is required" })}
                     />
                     {errors.title && (
                        <label className="label">
                           <span className="label-text-alt text-error">{errors.title.message}</span>
                        </label>
                     )}
                  </div>

                  {/* Preview Text */}
                  <div className="form-control">
                     <label className="label" htmlFor="previewText">
                        <span className="label-text font-medium">Preview Text <span className="text-error">*</span></span>
                        <span className="label-text-alt text-base-content/50">Shown in listings</span>
                     </label>
                     <textarea
                        id="previewText"
                        rows={3}
                        placeholder="Short description shown in post listings…"
                        className={`textarea textarea-bordered w-full resize-y ${errors.previewText ? "textarea-error" : ""}`}
                        {...register("previewText", { required: "Preview text is required" })}
                     />
                     {errors.previewText && (
                        <label className="label">
                           <span className="label-text-alt text-error">{errors.previewText.message}</span>
                        </label>
                     )}
                  </div>

                  {/* Body */}
                  <div className="form-control">
                     <label className="label" htmlFor="body">
                        <span className="label-text font-medium">Body <span className="text-error">*</span></span>
                     </label>
                     <textarea
                        id="body"
                        rows={14}
                        placeholder="Full post content…"
                        className={`textarea textarea-bordered w-full resize-y font-mono text-sm ${errors.body ? "textarea-error" : ""}`}
                        {...register("body", { required: "Body is required" })}
                     />
                     {errors.body && (
                        <label className="label">
                           <span className="label-text-alt text-error">{errors.body.message}</span>
                        </label>
                     )}
                  </div>
               </div>
            </section>

            {/* ── Section: Media & Links ── */}
            <section className="card bg-base-100 border border-base-200 shadow-sm">
               <div className="card-body gap-5">
                  <h2 className="card-title text-base font-semibold">Media &amp; Links</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     {/* Image URL */}
                     <div className="form-control">
                        <label className="label" htmlFor="imageUrl">
                           <span className="label-text font-medium">Image URL</span>
                        </label>
                        <input
                           id="imageUrl"
                           type="url"
                           placeholder="https://…"
                           className={`input input-bordered w-full ${errors.imageUrl ? "input-error" : ""}`}
                           {...register("imageUrl", {
                              validate: (v) =>
                                 !v || /^https?:\/\/.+/.test(v) || "Must be a valid URL",
                           })}
                        />
                        {errors.imageUrl && (
                           <label className="label">
                              <span className="label-text-alt text-error">{errors.imageUrl.message}</span>
                           </label>
                        )}
                     </div>

                     {/* External Href */}
                     <div className="form-control">
                        <label className="label" htmlFor="href">
                           <span className="label-text font-medium">External Link (href)</span>
                        </label>
                        <input
                           id="href"
                           type="url"
                           placeholder="https://…"
                           className={`input input-bordered w-full ${errors.href ? "input-error" : ""}`}
                           {...register("href", {
                              validate: (v) =>
                                 !v || /^https?:\/\/.+/.test(v) || "Must be a valid URL",
                           })}
                        />
                        {errors.href && (
                           <label className="label">
                              <span className="label-text-alt text-error">{errors.href.message}</span>
                           </label>
                        )}
                     </div>
                  </div>
               </div>
            </section>

            {/* ── Section: Scheduling ── */}
            <section className="card bg-base-100 border border-base-200 shadow-sm">
               <div className="card-body gap-5">
                  <h2 className="card-title text-base font-semibold">Scheduling</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     {/* Release Date */}
                     <div className="form-control">
                        <label className="label" htmlFor="releaseDate">
                           <span className="label-text font-medium">Release Date</span>
                        </label>
                        <input
                           id="releaseDate"
                           type="datetime-local"
                           className="input input-bordered w-full"
                           {...register("releaseDate")}
                        />
                        <label className="label">
                           <span className="label-text-alt text-base-content/50">Leave blank to publish immediately</span>
                        </label>
                     </div>

                     {/* Expire Date */}
                     <div className="form-control">
                        <label className="label" htmlFor="expireDate">
                           <span className="label-text font-medium">Expire Date</span>
                        </label>
                        <input
                           id="expireDate"
                           type="datetime-local"
                           className="input input-bordered w-full"
                           {...register("expireDate")}
                        />
                        <label className="label">
                           <span className="label-text-alt text-base-content/50">Leave blank to never expire</span>
                        </label>
                     </div>
                  </div>
               </div>
            </section>

            {/* ── Section: Categories ── */}
            {categories.length > 0 && (
               <section className="card bg-base-100 border border-base-200 shadow-sm">
                  <div className="card-body gap-4">
                     <h2 className="card-title text-base font-semibold">Categories</h2>
                     <Controller
                        name="categoryIds"
                        control={control}
                        render={({ field }) => (
                           <div className="flex flex-wrap gap-3">
                              {categories.map((cat) => {
                                 const checked = field.value?.includes(cat.categoryId);
                                 return (
                                    <label
                                       key={cat.categoryId}
                                       className="flex items-center gap-2 cursor-pointer"
                                    >
                                       <input
                                          type="checkbox"
                                          className="checkbox checkbox-sm"
                                          checked={checked}
                                          onChange={() => {
                                             const next = checked
                                                ? field.value.filter((id) => id !== cat.categoryId)
                                                : [...(field.value ?? []), cat.categoryId];
                                             field.onChange(next);
                                          }}
                                       />
                                       <span className="text-sm">{cat.name}</span>
                                    </label>
                                 );
                              })}
                           </div>
                        )}
                     />
                  </div>
               </section>
            )}

            {/* ── Section: Settings ── */}
            <section className="card bg-base-100 border border-base-200 shadow-sm">
               <div className="card-body gap-5">
                  <h2 className="card-title text-base font-semibold">Settings</h2>

                  <div className="flex flex-col sm:flex-row gap-6">
                     {/* Approved */}
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input
                           type="checkbox"
                           className="toggle toggle-success"
                           {...register("approved")}
                        />
                        <div>
                           <p className="text-sm font-medium">Approved</p>
                           <p className="text-xs text-base-content/50">Visible to the public</p>
                        </div>
                     </label>

                     {/* Comments Enabled */}
                     <label className="flex items-center gap-3 cursor-pointer">
                        <input
                           type="checkbox"
                           className="toggle"
                           {...register("commentsEnabled")}
                        />
                        <div>
                           <p className="text-sm font-medium">Comments Enabled</p>
                           <p className="text-xs text-base-content/50">Allow readers to comment</p>
                        </div>
                     </label>
                  </div>

                  {/* View Count (read-only) */}
                  <div className="form-control max-w-xs">
                     <label className="label" htmlFor="viewCount">
                        <span className="label-text font-medium">View Count</span>
                        <span className="label-text-alt text-base-content/50">Read-only</span>
                     </label>
                     <input
                        id="viewCount"
                        type="number"
                        className="input input-bordered w-full bg-base-200 cursor-not-allowed"
                        readOnly
                        {...register("viewCount", { valueAsNumber: true })}
                     />
                  </div>
               </div>
            </section>

            {/* ── Section: Audit (read-only) ── */}
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

            {/* ── Actions ── */}
            <div className="flex items-center justify-between pt-2">
               <div className="flex gap-3">
                  <button
                     type="submit"
                     disabled={isSaving || !isDirty}
                     className="btn btn-neutral"
                  >
                     {isSaving && <span className="loading loading-spinner loading-sm" />}
                     {isSaving ? "Saving…" : isNew ? "Create Post" : "Save Changes"}
                  </button>
                  {onCancel && (
                     <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onCancel}
                     >
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
   );
}
