"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApiContext } from '@/components/context/ApiContext';
import { getPostUrl, savePost, usePosts } from '@/api/post/post-fetcher';
import { Post } from '@/api/post/post';
import PostEditor from "./PostEditor";
import useSWR from "swr";
import { swrOptions } from "@/lib/swr.functions";

export default function EditPostPage() {
   const { id } = useParams<{ id: string }>();
   const router = useRouter();
   const { httpGet, httpPost } = useApiContext();
   const [isSaving, setIsSaving] = useState(false);
   const [saveError, setSaveError] = useState<string | null>(null);
   const [saveSuccess, setSaveSuccess] = useState(false);

   const isNew = id === "new";

   const { data: post, isLoading: postLoading } = useSWR<Post>(
      !isNew ? getPostUrl(Number(id)) : null,
      httpGet,
      { ...swrOptions }
   );

   // Fetch categories for the checkbox list — adjust the URL to match your API
   const { data: categories, isLoading: catsLoading } = useSWR<{ categoryId: number; name: string }[]>(
      "api/category",
      httpGet,
      { ...swrOptions }
   );

   const handleSave = async (data: Post) => {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
         await savePost(httpPost, data);
         setSaveSuccess(true);
         if (isNew) router.push("/admin/post");
      } catch (err: any) {
         setSaveError(err?.message ?? "Failed to save post.");
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <div className="space-y-6 max-w-4xl">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <div className="text-sm text-base-content/50 mb-1">
                  <button
                     className="hover:text-base-content transition-colors"
                     onClick={() => router.push("/admin/post")}
                  >
                     Posts
                  </button>
                  {" / "}
                  <span>{isNew ? "New Post" : (post?.title ?? `Post ${id}`)}</span>
               </div>
               <h1 className="text-2xl font-semibold text-base-content">
                  {isNew ? "New Post" : "Edit Post"}
               </h1>
            </div>
         </div>

         {/* Alerts */}
         {saveError && (
            <div role="alert" className="alert alert-error">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
               <span>{saveError}</span>
            </div>
         )}
         {saveSuccess && (
            <div role="alert" className="alert alert-success">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
               <span>Post saved successfully.</span>
            </div>
         )}

         <PostEditor
            post={post}
            categories={categories}
            isLoading={postLoading || catsLoading}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={() => router.push("/admin/post")}
         />
      </div>
   );
}
