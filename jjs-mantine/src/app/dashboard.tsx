//import { useState } from 'react'
import './App.css'
import { Box, Container } from '@mantine/core'
import { useApiContext } from '../api/ApiContext'
import { useCarouselImages } from '../api/album/image-fetcher'
import { Carousel } from '@mantine/carousel';

function App() {
   const { httpGet } = useApiContext();
   const { data: carouselImages } = useCarouselImages(httpGet);

   console.log('Carousel Images:', carouselImages);
   return (
      <Container strategy="grid" size={500}>
         <Box bg="var(--mantine-color-indigo-light)" h={50}>
            Main content

            <Carousel withIndicators height={200}>
               <Carousel.Slide>1</Carousel.Slide>
               <Carousel.Slide>2</Carousel.Slide>
               <Carousel.Slide>3</Carousel.Slide>
               {/* ...other slides */}
            </Carousel>
         </Box>
      </Container>
  )
}

export default App
