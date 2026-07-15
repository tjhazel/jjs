import type { ImageSummary } from "./image-details";

const imageModules = import.meta.glob(
  '/public/images/carousel/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}'
);

function toTitle(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const carouselImages: ImageSummary[] = Object.keys(imageModules)
  .map(globPath => ({
    path: globPath.replace('/public', ''),
    title: toTitle(globPath.split('/').pop()!),
  }))
  .sort(() => Math.random() - 0.5);

export function useCarouselImages() {
  return { data: carouselImages };
}
