import { useState, useEffect } from 'react';

interface UseCarouselOptions<T> {
  items: T[];
  interval?: number;
  autoPlay?: boolean;
}

/**
 * Custom hook for carousel/rotating content
 * Handles automatic rotation through items
 */
export function useCarousel<T>(options: UseCarouselOptions<T>) {
  const { items, interval = 5000, autoPlay = true } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const next = () => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  };
  
  const prev = () => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };
  
  const goTo = (index: number) => {
    setCurrentIndex(index % items.length);
  };
  
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [items.length, interval, autoPlay]);
  
  return {
    currentIndex,
    currentItem: items[currentIndex],
    next,
    prev,
    goTo,
  };
}

