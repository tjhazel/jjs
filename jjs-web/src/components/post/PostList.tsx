import { SimpleGrid } from '@mantine/core';
import PostCard from './PostCard';
import type { PostDetail } from '../../api/post/post';

interface PostListProps {
  posts: PostDetail[] | undefined;
}

export default function PostList({ posts }: PostListProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
      {posts?.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </SimpleGrid>
  );
}
