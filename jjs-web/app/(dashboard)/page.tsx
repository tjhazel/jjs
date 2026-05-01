"use client" 

import Carousel from '@/components/ui/Carousel';
import { useApiContext } from '@/components/context/ApiContext';
import { useCarouselImages } from '@/api/album/image-fetcher';
import { usePosts } from '@/api/post/post-fetcher';
import ArticleList from '@/components/article/ArticleList';
import { Category_Home } from '@/api/post/category';

export default function HomePage() {
  const { httpGet } = useApiContext();
  const {data: carouselImages} = useCarouselImages(httpGet);
  const {data: posts} = usePosts(httpGet);

  return (
    <div className="space-y-12">
      {/* Welcome message */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900">
          Welcome
        </h1>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl">
          Explore our collection of memories, recipes, and stories. Currently refactoring the design and tech stack with improved performance and user experience.
        </p>
      </div>

      {/* Featured Posts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Featured Posts</h2>
        <div className="relative">
          <ArticleList posts={posts?.filter(y => y.categoryIds.includes(Category_Home))} />
        </div>
      </div>

      {/* Carousel */}
      <div className="bg-white border border-gray-200 p-6 sm:p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Photo Highlights</h2>
        <div className="aspect-video">
          <Carousel images={carouselImages} />
        </div>
      </div>
    </div>
  );
}
