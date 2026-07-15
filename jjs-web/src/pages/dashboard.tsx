import { useRef } from 'react';
import { useSearchParams } from 'react-router';
import Autoplay from 'embla-carousel-autoplay';
import { Box, Center, Group, Image, Loader, Stack, Text, TextInput } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconSearch } from '@tabler/icons-react';
import { useApiContext } from '@api/ApiContext';
import { useCarouselImages } from '@api/album/image-fetcher';
import { usePosts } from '@api/post/post-fetcher';
import PostList from '@components/post/PostList';
import CategorySelector from '@components/post/CategorySelector';
import InfiniteScroll from '@components/ui/InfiniteScroll';

function DashboardPage() {
  const { httpGet } = useApiContext();
  const { data: carouselImages } = useCarouselImages();
  const { data: posts, isLoading } = usePosts(httpGet);
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') ? Number(searchParams.get('category')) : null;
  const textFilter = searchParams.get('q') ?? '';
  const handleCategoryChange = (id: number | null) => {
    setSearchParams(prev => {
      if (id == null) prev.delete('category');
      else prev.set('category', String(id));
      return prev;
    });
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

  const slides = (carouselImages || []).map((img) => (
    <Carousel.Slide key={img.path}
    style={{ 
      backgroundColor: 'var(--mantine-color-dark-8)', // Dark neutral backdrop filler
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Image src={img.path} 
         alt={img.title} 
         height={300} 
         w="auto"          // 👉 Tells Mantine to dynamically calculate scaling width
         fit="contain"     // 👉 Keeps the aspect ratio locked without side-clipping
   />
    </Carousel.Slide>
  ));

  return (
    <>
      <Box bg="var(--mantine-color-indigo-light)" mb="xl">
        {/* 
          👉 FIXED: Added loop property assignment directly to layout configs
        */}
        <Carousel
          withIndicators
          height={300}
          plugins={[autoplay.current]}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
        >
          {slides}
        </Carousel>
      </Box>

        <Box bg="var(--mantine-color-indigo-light)">
          <Group justify="flex-end" px="md" pb="sm">
            <TextInput
              placeholder="Search posts..."
              leftSection={<IconSearch size={14} />}
              value={textFilter}
              onChange={e => handleTextFilter(e.currentTarget.value)}
              style={{ minWidth: 220 }}
            />
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
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
