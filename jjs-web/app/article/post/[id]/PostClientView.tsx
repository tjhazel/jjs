"use client"

import Markdown from 'react-markdown';
import { usePosts } from '@/api/post/post-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import { useRouter } from 'next/navigation';

interface Props {
   id: number;
}

export default function PostClientView({ id }: Props) {
    const router = useRouter();

    const { httpGet } = useApiContext();
    const {data: posts} = usePosts(httpGet);

    if (!posts) return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-600">Loading article...</p>
      </div>
    );

   const article = posts?.find(y => y.postId === id);

    if (!article) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-gray-600">Article not found.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      );
    }

  return (
    <article className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="space-y-4 pb-6 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
          {article.title}
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
          <span><strong>By</strong> {article.createdBy}</span>
          <span><strong>On</strong> {article.createdDate}</span>
          <span><strong>Views</strong> {article.viewCount || 0}</span>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {/* https://www.convertsimple.com/convert-html-to-markdown/ */}
        <Markdown>{article.body}</Markdown>
      </div>
    </article>
  );
}
