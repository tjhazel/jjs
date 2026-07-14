import { useState } from 'react';
import { Stack, Title, Text, SimpleGrid, Divider, Group, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import ImageCard from '@components/ui/ImageCard';
import { useApiContext } from '@api/ApiContext';
import { refreshAlbumCache } from '@api/album/album-fetcher';

export default function AdminPage() {
  const { httpPost } = useApiContext();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);

  const handleRefreshAlbum = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const result = await refreshAlbumCache(httpPost);
      setRefreshResult(`Cache rebuilt — ${result.fileCount} images indexed.`);
    } catch {
      setRefreshResult('Refresh failed. Check server logs.');
    } finally {
      setRefreshing(false);
    }
  };

  const placeholderCards = [
    { id: 1, title: "Posts",   description: "Edit all posts",   link: "/admin/posts" },
    { id: 2, title: "Recipes", description: "Edit all recipes", link: "/admin/recipes"  },
    { id: 3, title: "Users",   description: "View registered users and comment activity", link: "/admin/users" },
  ];

  return (
    <Stack gap="xl">

        <Stack gap={4}>
          <Title order={1} size="h1" fw={600} lh="sm" c="dark.9">Administration</Title>
          <Text size="sm" c="dimmed">Manage your site content and settings.</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {placeholderCards.map((card) => (
            <ImageCard
              key={card.id}
              title={card.title}
              previewText={card.description}
              previewLines={2}
              link={card.link}
              footerText="Manage more →"
            />
          ))}
        </SimpleGrid>

        <Divider />

        <Stack gap="sm">
          <Title order={2} size="h4" fw={600} c="dark.9">System Tools</Title>
          <Text size="sm" c="dimmed">
            Rebuilds the album image cache from disk. Run this after adding or removing photos.
          </Text>
          <Group align="center">
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="default"
              loading={refreshing}
              onClick={handleRefreshAlbum}
            >
              Refresh Album Cache
            </Button>
            {refreshResult && (
              <Text size="sm" c={refreshResult.includes('failed') ? 'red' : 'teal'}>
                {refreshResult}
              </Text>
            )}
          </Group>
        </Stack>

    </Stack>
  );
}
