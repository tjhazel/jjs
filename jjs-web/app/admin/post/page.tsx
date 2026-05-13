"use client" 
import { use } from 'react';
import Markdown from 'react-markdown';
import { usePosts } from '@/api/post/post-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import { useRouter } from 'next/navigation';
import PostTable from './PostTable';

export default function PostPage(
  { params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params); 

    const { httpGet } = useApiContext();
    const {data: posts, error, isLoading} = usePosts(httpGet);

    if (!posts) return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-600">Loading articles...</p>
      </div>
    );

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
            <button
               onClick={() => router.push("/admin/post/new")}
               className="px-4 py-2 text-sm border border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors"
            >
               + New Post
            </button>
         </div>

         {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
               {error}
            </div>
         )}

         <PostTable posts={posts} isLoading={isLoading} />
      </div>
   );
}
