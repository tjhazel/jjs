"use client"

import { usePosts } from '@/api/post/post-fetcher';
import { useApiContext } from '@/components/context/ApiContext';
import ArticleList from '@/components/article/ArticleList';
import { Category_All } from '@/api/post/category';

interface Props {
   id: number;
}

export default function CategoryClientView({ id }: Props) {

   console.log('Category ID from URL:', id);

    const { httpGet } = useApiContext();
    const {data: posts} = usePosts(httpGet);

    if (!posts) return 'Loading...';

  return (
    <div className="relative flex">
        <ArticleList posts={posts?.filter(y => id === Category_All || y.categoryIds.includes(id))} />
    </div>
  );
}
