import { useEffect, useRef } from 'react';
import { useNavigate, useLoaderData, useLocation, type LoaderFunctionArgs  } from 'react-router';
import MarkdownViewer from '@components/ui/MarkdownViewer';
import CommentList from '@components/comment/CommentList';
import PostReactions from '@components/post/PostReactions';
import { Container, Button, Title, Text, Group, Divider, Center, Loader, Stack } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { usePosts, viewPost } from '@api/post/post-fetcher';
import { useApiContext } from '@api/ApiContext';
import classes from './PostView.module.css';

// 🟢 1. EXPORT THE LOADER FROM HERE
export const postLoader = async ({ params }: LoaderFunctionArgs) => {
  const idStr = params.id; // Matches the ":id" segment in your route path

  if (!idStr) {
    throw new Response("Missing Post Identifier", { status: 400 });
  }

  const parsedId = parseInt(idStr, 10);
  if (isNaN(parsedId)) {
    throw new Response("Invalid Identification Format", { status: 400 });
  }

  return { id: parsedId };
};

export default function PostView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { httpGet, httpPatch } = useApiContext();
  const { data: posts } = usePosts(httpGet);

  const { id } = useLoaderData() as { id: number };

  const highlightCommentId = location.hash.startsWith('#comment-')
    ? parseInt(location.hash.slice('#comment-'.length), 10) || undefined
    : undefined;

  const post = posts?.find((y) => y.postId === id);

  const viewTracked = useRef(false);
  useEffect(() => {
    if (post?.postId && !viewTracked.current) {
      viewTracked.current = true;
      viewPost(httpPatch, post.postId);
    }
  }, [post?.postId]);

  // 1. Handle Initial Loading State
  if (!posts) {
    return (
      <Center py={64}>
        <Group gap="sm">
          <Loader size="sm" type="dots" />
          <Text c="dimmed">Loading post...</Text>
        </Group>
      </Center>
    );
  }

  // 2. Handle Missing/Not Found Post State
  if (!post) {
    return (
      <Center py={64}>
        <Stack align="center" gap="md">
          <Text c="dimmed">Post not found.</Text>
          <Button
            onClick={() => navigate(-1)}
            variant="filled"
            color="dark"
            radius="none"
          >
            Go Back
          </Button>
        </Stack>
      </Center>
    );
  }

  // 3. Render Post Detail Content View
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">

        {/* Header Block */}
        <Stack gap="sm">
          <Group>
            <Button
              onClick={() => navigate(-1)}
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              size="sm"
              styles={{ root: { paddingLeft: 0, paddingRight: 0 } }}
            >
              Back
            </Button>
          </Group>

          <Title order={1} size="h1" fw={600} lh="sm" c="dark.9">
            {post.title}
          </Title>

          <Group gap="lg" c="gray.6">
            <Text size="sm">
              <strong>By</strong> {post.createdBy}
            </Text>
            <Text size="sm">
              <strong>On</strong> {new Date(post.createdDate).toLocaleDateString()}
            </Text>
            <Text size="sm">
              <strong>Views</strong> {post.viewCount || 0}
            </Text>
          </Group>

          <Divider mt="xs" />
        </Stack>

        {/* Markdown Content Area */}
        <div className={classes.prose}>
          <MarkdownViewer>{post.body}</MarkdownViewer>
        </div>

        {/* Reactions */}
        {post.postId && <PostReactions postId={post.postId} />}

        {/* Comments */}
        {post.commentsEnabled && post.postId && (
          <Stack gap="md">
            <Divider />
            <Title order={3} fw={600}>Comments</Title>
            <CommentList postId={post.postId} highlightCommentId={highlightCommentId} />
          </Stack>
        )}

      </Stack>
    </Container>
  );
}
