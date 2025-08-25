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

export default function CustomersPage() {
  const { httpGet } = useApiContext();
  const {data: carouselImages} = useCarouselImages(httpGet);
  const {data: posts} = usePosts(httpGet);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to our virtual home!</CardTitle>
        <CardDescription>something splashy here</CardDescription>
      </CardHeader>
      <CardContent>

        <div className="relative flex">
          <ArticleList articles={posts} />
        </div>

        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
          <Carousel images={carouselImages} />
        </div>

      </CardContent>
    </Card>
  );
}
