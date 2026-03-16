"use client" 
import { use } from 'react';
import { usePosts } from '@/api/post/post-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import ArticleList from '@/components/article/ArticleList';
import { Category_All } from '@/api/post/category';


export default function CategoryPage(
  { params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); 
    const categoryId = Number(id);

    console.log('Category ID from URL:', categoryId);

    const { httpGet } = useApiContext();
    const {data: posts} = usePosts(httpGet);

    if (!posts) return 'Loading...';

  return (
    <div className="relative flex">
      <ArticleList posts={posts?.filter(y => categoryId===Category_All || y.categoryIds.includes(categoryId))} />
    </div>
  );
}
