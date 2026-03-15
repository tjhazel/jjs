"use client" 

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Carousel from '@/components/ui/Carousel';
import { useApiContext } from '@/components/context/ApiContext';
import { useCarouselImages } from '@/api/album/image-fetcher';
 import { usePosts } from '@/api/post/post-fetcher';
 import ArticleList from '@/components/article/ArticleList';
import { Category_Home } from '@/api/post/category';

export default function CustomersPage() {
  const { httpGet } = useApiContext();
  const {data: carouselImages} = useCarouselImages(httpGet);
  const {data: posts} = usePosts(httpGet);

  console.log('httpGet', httpGet)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to our virtual home</CardTitle>
        <CardDescription>🚧 Refactoring in progress. I'm updating the design and tech stack behind the scenes, so you may see a few changes as improvements are deployed.</CardDescription>
      </CardHeader>
      <CardContent>

        <div className="relative flex">
          <ArticleList posts={posts?.filter(y => y.categoryIds.includes(Category_Home))} />
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <Carousel images={carouselImages} />
        </div>

      </CardContent>
    </Card>
  );
}
