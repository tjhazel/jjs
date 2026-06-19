import React from 'react';
import { useNavigate, useLoaderData, type LoaderFunctionArgs  } from 'react-router'; // 👉 Import useLoaderData hook
import Markdown from 'react-markdown';
import { Container, Button, Title, Text, Group, Divider, Center, Loader, Stack } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { usePosts } from '@api/post/post-fetcher';
import { useApiContext } from '@api/ApiContext';
import classes from './ArticleView.module.css';

// 🟢 1. EXPORT THE LOADER FROM HERE
export const articleLoader = async ({ params }: LoaderFunctionArgs) => {
  const idStr = params.id; // Matches the ":id" segment in your route path
  
  if (!idStr) {
    throw new Response("Missing Article Identifier", { status: 400 });
  }

  const parsedId = parseInt(idStr, 10);
  if (isNaN(parsedId)) {
    throw new Response("Invalid Identification Format", { status: 400 });
  }

  return { id: parsedId };
};

export default function ArticleView() {
  const navigate = useNavigate();
  const { httpGet } = useApiContext();
  const { data: posts } = usePosts(httpGet);

  // 👉 Pull parsed id state directly out of the route data layer
  const { id } = useLoaderData() as { id: number };

  // 1. Handle Initial Loading State
  if (!posts) {
    return (
      <Center py={64}>
        <Group gap="sm">
          <Loader size="sm" type="dots" />
          <Text c="dimmed">Loading article...</Text>
        </Group>
      </Center>
    );
  }

  const article = posts.find((y) => y.postId === id);

  // 2. Handle Missing/Not Found Article State
  if (!article) {
    return (
      <Center py={64}>
        <Stack align="center" gap="md">
          <Text c="dimmed">Article not found.</Text>
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
            {article.title}
          </Title>

          <Group gap="lg" c="gray.6">
            <Text size="sm">
              <strong>By</strong> {article.createdBy}
            </Text>
            <Text size="sm">
              <strong>On</strong> {new Date(article.createdDate).toLocaleDateString()}
            </Text>
            <Text size="sm">
              <strong>Views</strong> {article.viewCount || 0}
            </Text>
          </Group>
          
          <Divider mt="xs" />
        </Stack>

        {/* Markdown Content Area */}
        <div className={classes.prose}>
          <Markdown>{article.body}</Markdown>
        </div>

      </Stack>
    </Container>
  );
}
