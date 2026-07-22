import { useNavigate } from 'react-router';
import { Stack, Group, Title, Button, Alert, Text } from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { useAllPosts } from '@api/post/post-fetcher';
import { useApiContext } from '@api/ApiContext';
import ManagePosts from '@components/post/edit/ManagePosts';

export default function ManagePostsPage() {
  const navigate = useNavigate();
  const { httpGet } = useApiContext();
   const { data: posts, error, isLoading } = useAllPosts(httpGet);

  return (
     <Stack gap="sm">

        {/* Dynamic Action Header Utility Block */}
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Title order={1} size="h3" fw={600} lh="sm">
              Posts
            </Title>
            <Text size="xs" c="dimmed">
              Create, modify, and review published posts or draft content.
            </Text>
          </Stack>

          <Button
            variant="default"
            radius="none"
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate("/admin/post/new")} // Routes cleanly to editor form block
          >
            New Post
          </Button>
        </Group>

        {/* Fetching Failure Alert Tracker */}
        {error && (
          <Alert
            variant="light"
            color="red"
            title="Data Fetching Alert"
            icon={<IconAlertCircle size={16} />}
            radius="none"
          >
            {typeof error === 'string' ? error : 'An unexpected data failure surfaced while loading documents.'}
          </Alert>
        )}

        {/* Core Component List Mount */}
        <ManagePosts posts={posts} isLoading={isLoading} />

    </Stack>
  );
}
