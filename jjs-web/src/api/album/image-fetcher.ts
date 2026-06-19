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
   console.log(httpGet, 'httpGet');

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
      path: '/images/carousel/150000Miles.jpg',
      title: '150k miles and still not famous',
      description: '150,000 miles and we never got featured on a TV commercial'
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
      path: '/images/carousel/buyavowel.jpg',
      title: 'Smile',
      description: 'How can you not smile with this thing over your head'
    }
  ];
