import { Box, Container, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useApiContext } from '@api/ApiContext';
import { useCarouselImages } from '@api/album/image-fetcher';
import { usePosts } from '@api/post/post-fetcher';
import ArticleList from '@components/article/ArticleList';
import { Category_Home } from '@api/post/category';

function DashboardPage() {
  const { httpGet } = useApiContext();
  const { data: carouselImages } = useCarouselImages(httpGet);
  const { data: posts } = usePosts(httpGet);

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
    <Container size="xl" py="md">
      <Box bg="var(--mantine-color-indigo-light)" mb="xl">
        {/* 
          👉 FIXED: Added loop property assignment directly to layout configs
        */}
        <Carousel 
          withIndicators 
          loop 
          height={300}
        >
          {slides}
        </Carousel>
      </Box>

      <Box bg="var(--mantine-color-indigo-light)">
        <ArticleList posts={posts?.filter(y => y.categoryIds.includes(Category_Home))} />
      </Box>
    </Container>
  );
}

export default DashboardPage;
