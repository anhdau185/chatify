import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '@components/ui/button';
import './CarouselSlider.css';

export default function CarouselSlider({
  children,
}: {
  children: ReactNode[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth',
      });
    }
  };

  const handlePrevious = () => {
    const itemCount = Children.count(children);
    const newIndex = currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const itemCount = Children.count(children);
    const newIndex = (currentIndex + 1) % itemCount;
    scrollToIndex(newIndex);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const updateCurrentIndex = () => {
      const scrollLeft = carousel.scrollLeft;
      const itemWidth = carousel.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(index);
    };

    carousel.addEventListener('scroll', updateCurrentIndex);

    return () => {
      carousel.removeEventListener('scroll', updateCurrentIndex);
    };
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel" ref={carouselRef}>
        {Children.map(children, (child, i) => (
          <div key={i} className="carousel-item">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="carousel-controls">
        <Button
          className="carousel-button prev"
          onClick={handlePrevious}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {/* Dot indicators */}
        <div className="carousel-dots">
          {Children.map(children, (_, i) => (
            <button
              key={i}
              className={clsx(['carousel-dot', i === currentIndex && 'active'])}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <Button
          className="carousel-button next"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
