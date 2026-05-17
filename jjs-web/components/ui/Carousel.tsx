'use client';

import { ImageSummary } from '@/api/album/image-details';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto">
      <div className="carousel carousel-center rounded-lg bg-base-200 p-4 space-x-4 w-full overflow-hidden">
        <div
          className="flex transition-transform ease-out duration-500"
          style={{ transform: `translateX(-${(currentIndex * 100) / visibleCount}%)` }}
        >
          {images.map(({ path, title, description }, idx) => (
            <div
              key={idx}
              className="carousel-item flex-shrink-0 w-1/2 flex flex-col items-center px-3"
            >
              <div className="card card-compact bg-base-100 shadow-lg">
                <div className="card-body items-center text-center">
                  <h2 className="card-title text-lg font-semibold">{title}</h2>
                  <img
                    src={path}
                    alt={title}
                    className="max-h-[300px] mx-auto object-contain rounded"
                  />
                  {description && (
                    <p className="text-sm text-base-content/70 max-w-md">{description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons with daisyUI styling */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={prevSlide}
          className="btn btn-circle btn-outline"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="btn btn-circle btn-outline"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicators with daisyUI styling */}
      <div className="mt-4 flex justify-center gap-2 flex-wrap">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`badge ${
              idx === currentIndex ? 'badge-primary' : 'badge-outline'
            } cursor-pointer hover:badge-primary transition-colors`}
          />
        ))}
      </div>
    </div>
  );
}

