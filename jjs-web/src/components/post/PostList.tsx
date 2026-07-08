import { SimpleGrid } from '@mantine/core';
import ImageCard from '@components/ui/ImageCard';
import type { PostDetail } from '../../api/post/post';

interface PostListProps {
  posts: PostDetail[] | undefined;
}

export default function PostList({ posts }: PostListProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
      {posts?.map((post) => (
        <ImageCard
          key={post.postId}
          title={post.title}
          previewText={post.previewText}
          previewLines={3}
          timestamp={new Date(post.createdDate)}
          imageUrl={post.imageUrl}
          link={`/post/${post.postId}`}
          footerText="Read more →"
        />
      ))}
    </SimpleGrid>
  );
}
