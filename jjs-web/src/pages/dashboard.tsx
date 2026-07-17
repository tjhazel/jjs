import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { ActionIcon, Box, Center, Group, Loader, Popover, Stack, Text, TextInput } from '@mantine/core';
import { IconAdjustments, IconSearch } from '@tabler/icons-react';
import { useApiContext } from '@api/ApiContext';
import { usePosts } from '@api/post/post-fetcher';
import CarouselBanner from '@components/ui/CarouselBanner';
import PostList from '@components/post/PostList';
import CategorySelector from '@components/post/CategorySelector';
import InfiniteScroll from '@components/ui/InfiniteScroll';

function DashboardPage() {
  const { httpGet } = useApiContext();
  const { data: posts, isLoading } = usePosts(httpGet);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const textFilter = searchParams.get('q') ?? '';
  const handleCategoryChange = (id: number | null) => {
    setSearchParams(prev => {
      if (id == null) prev.delete('category');
      else prev.set('category', String(id));
      return prev;
    });
    setFilterOpen(false);
  };

  const handleTextFilter = (value: string) => {
    setSearchParams(prev => {
      if (!value) prev.delete('q');
      else prev.set('q', value);
      return prev;
    });
  };

  const needle = textFilter.toLowerCase();
  const homePosts = posts?.filter(p => {
    const matchesCategory = selectedCategory == null || p.categoryIds.includes(selectedCategory);
    const matchesText = !needle
      || p.title.toLowerCase().includes(needle)
      || p.previewText.toLowerCase().includes(needle)
      || p.body.toLowerCase().includes(needle);
    return matchesCategory && matchesText;
  }) ?? [];

  if (isLoading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <Loader size="lg" type="dots" />
          <Text size="sm" c="dimmed">Loading posts...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <CarouselBanner />

        <Box bg="var(--mantine-color-gray-0)">
          <Group justify="flex-end" px="md" py={6} wrap="nowrap">
            <TextInput
              placeholder="Search posts..."
              leftSection={<IconSearch size={14} />}
              value={textFilter}
              onChange={e => handleTextFilter(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 0, maxWidth: 300 }}
            />
            <Popover
              opened={filterOpen}
              onChange={setFilterOpen}
              position="bottom-end"
              withinPortal
            >
              <Popover.Target>
                <ActionIcon
                  size="input-sm"
                  variant={selectedCategory != null ? 'filled' : 'default'}
                  onClick={() => setFilterOpen(o => !o)}
                  aria-label="Filter by category"
                >
                  <IconAdjustments size={16} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </Popover.Dropdown>
            </Popover>
          </Group>
          <InfiniteScroll
            items={homePosts}
            pageSize={9}
            resetKey={searchParams}
            endMessage={<Text ta="center" c="dimmed" mt="md" mb="xl">You're all caught up.</Text>}
          >
            {(visiblePosts) => <PostList posts={visiblePosts} />}
          </InfiniteScroll>
        </Box>
    </>
  );
}

export default DashboardPage;
