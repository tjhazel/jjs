import { Box, Center, Image, Loader, Stack, Text } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useApiContext } from '@api/ApiContext';
import { useCarouselImages } from '@api/album/image-fetcher';
import { usePosts } from '@api/post/post-fetcher';
import PostList from '@components/post/PostList';
//import { Category_Home } from '@api/post/category';

function DashboardPage() {
  const { httpGet } = useApiContext();
  const { data: carouselImages } = useCarouselImages(httpGet);
   const { data: homePosts, isLoading } = usePosts(httpGet);

   //const homePosts = posts?.filter(y => y.categoryIds.includes(Category_Home));

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
        >
          {slides}
        </Carousel>
      </Box>

        <Box bg="var(--mantine-color-indigo-light)">
           {isLoading && 
              <Center py="xl">
                 <Stack align="center" gap="xs">
                    <Loader size="lg" type="dots" />
                    <Text size="sm" c="dimmed">Loading posts...</Text>
                 </Stack>
              </Center>
           }
           {!isLoading &&
              <PostList posts={homePosts} />
           }
      </Box>
    </>
  );
}

export default DashboardPage;
