'use client';

import { ImageSummary } from '@/api/album/image-details';
import { useState } from 'react';

interface CarouselProps {
  images: ImageSummary[];
}

export default function Carousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 2; // number of images to show simultaneously
  const maxIndex = Math.max(images.length - visibleCount, 0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg">
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${(currentIndex * 100) / visibleCount}%)` }}
      >
        {images.map(({ path, title, description }, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-1/2 flex flex-col items-center px-3"
          >
            <h2 className="mb-1 text-lg font-semibold text-center">{title}</h2>
            <img
              src={path}
              alt={title}
              className="max-h-[300px] mx-auto object-contain"
            />
            {description && (
              <p className="mt-2 text-sm text-gray-600 text-center max-w-md">{description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
        aria-label="Previous Slide"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full hover:bg-opacity-70"
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* Indicators below carousel */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`w-3 h-3 rounded-full ${
              idx === currentIndex ? 'bg-gray-900' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
