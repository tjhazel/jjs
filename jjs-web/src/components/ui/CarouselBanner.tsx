import { useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Box, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useCarouselImages } from '@api/album/image-fetcher';

function CarouselBanner() {
  const { data: carouselImages } = useCarouselImages();
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  const [activeIndex, setActiveIndex] = useState(0);

  const images = carouselImages || [];
  const slides = images.map((img, index) => {
    const isNearActive = Math.abs(index - activeIndex) <= 1;
    return (
      <Carousel.Slide key={img.path} style={{
        backgroundColor: 'var(--mantine-color-dark-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isNearActive && (
          <Image src={img.path} alt={img.title} h={{ base: '25vh', sm: 300 }} w="auto" fit="contain" />
        )}
      </Carousel.Slide>
    );
  });

  return (
    <Box bg="var(--mantine-color-teal-0)" mb={{ base: 'xs', sm: 'xl' }}>
      <Carousel
        withIndicators
        height={{ base: '25vh', sm: 300 }}
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        onSlideChange={setActiveIndex}
      >
        {slides}
      </Carousel>
    </Box>
  );
}

export default CarouselBanner;
