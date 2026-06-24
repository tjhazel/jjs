import type { HttpError, TGet } from "@/lib/httpClient";
import type { ImageSummary } from "./image-details";
//import useSWR from "swr";
//import { swrOptions } from "@/lib/swr.functions";
import { useMemo } from "react";


export const imageBaseUrl = `api/image`;
export const getCarouselImagesUrl = `${imageBaseUrl}/CarouselImages`;


export function useCarouselImages(httpGet: TGet) {
  //  const { data, isValidating, error } = useSWR<ImageSummary[], HttpError>(
  //     getCarouselImagesUrl,
  //     httpGet,
  //     { ...swrOptions }
   //  );
   console.log(httpGet, 'httpGet logged here to avoid an error:(');

   const { data, isValidating, error } = useMemo(() => {
      return {
        data: carouselImages,
        isValidating: false,
        error: {} as HttpError
      }
   }, [])

   return {
      data: data,
      isLoading: !error && !data && isValidating,
      error: error?.message
   };
}


  const carouselImages: ImageSummary[] = [
     {
      path: '/images/carousel/athens-view.jpg',
      title: 'Athens View',
      description: 'A view of the city of Athens, Greece after a short(ish) hike up to the top of Mount Lycabettus'
    },
   {
      path: '/images/carousel/parthenon.jpg',
      title: 'Three Amigos at the Parthenon',
      description: 'Great day visiting the Parthenon in Athens, Greece'
    },
    {
      path: '/images/carousel/eiffeltower.jpg',
      title: 'Three Amigos at the Eiffel Tower',
      description: 'Great day visiting the Eiffel Tower in Paris, France'
    },
    {
      path: '/images/carousel/eiffelatnight.jpg',
      title: 'The Eiffel Tower after dark',
      description: 'Super sparkly Eiffel Tower in Paris, France'
    },
  {
      path: '/images/carousel/TokyoTower-3.jpg',
      title: 'The Tokyo Tower',
      description: 'Tokyo Tower in Tokyo, Japan'
    },  
    {
      path: '/images/carousel/DisneyEarthquake.jpg',
      title: 'Disney Earthquake',
      description: 'Fun day at Disney Tokyo with a little earthquake thrown in for good measure'
    },    
    {
      path: '/images/carousel/MeaningofLife.jpg',
      title: 'Naya and the Meaning of Life',
      description: 'She is contemplating the meaning of life - or maybe just bored'
    },
     {
      path: '/images/carousel/bristol.jpg',
      title: 'Bristol',
      description: 'Getting ready to see a little bumping and banging'
    },
     {
      path: '/images/carousel/buyavowel.jpg',
      title: 'First Cherries',
      description: 'Jeri...can I buy a vowel'
    },
     {
      path: '/images/carousel/check-mate.jpg',
      title: 'Check Mate',
      description: 'Would you like to play a game'
    },
     {
      path: '/images/carousel/parasail.jpg',
      title: 'Smile',
      description: 'How can you not smile with this thing over your head'
     },
     {
        path: '/images/carousel/welcometosydney.jpg',
        title: 'Sydney',
        description: 'First stop on our 5 week vacation'
     },
  ];
