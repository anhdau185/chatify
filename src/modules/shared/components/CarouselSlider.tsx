import { Children, useEffect, useRef, useState, type ReactNode } from 'react';

import './CarouselSlider.css';

export default function CarouselSlider({
  children,
}: {
  children: ReactNode[];
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemCount = Children.count(children);

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
    const newIndex = currentIndex === 0 ? itemCount - 1 : currentIndex - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
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
    return () => carousel.removeEventListener('scroll', updateCurrentIndex);
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
        <button
          className="carousel-button carousel-button-prev"
          onClick={handlePrevious}
          aria-label="Previous slide"
        >
          Previous Tip
        </button>

        {/* Dot indicators */}
        <div className="carousel-dots">
          {Children.map(children, (_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="carousel-button carousel-button-next"
          onClick={handleNext}
          aria-label="Next slide"
        >
          Next Tip
        </button>
      </div>
    </div>
  );
}
