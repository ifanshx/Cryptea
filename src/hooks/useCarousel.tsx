// hooks/useCarousel.ts
import { useState, useEffect } from 'react';

export function useCarousel(length: number, autoPlayInterval = 5000) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    useEffect(() => {
        if (!isAutoPlay) return;

        const timer = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % length);
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [isAutoPlay, activeIndex, length, autoPlayInterval]);

    const goToSlide = (index: number) => {
        setActiveIndex(index);
        setIsAutoPlay(false);
        setTimeout(() => setIsAutoPlay(true), 10000);
    };

    const nextSlide = () => {
        setActiveIndex(prev => (prev + 1) % length);
        setIsAutoPlay(false);
        setTimeout(() => setIsAutoPlay(true), 10000);
    };

    const prevSlide = () => {
        setActiveIndex(prev => (prev - 1 + length) % length);
        setIsAutoPlay(false);
        setTimeout(() => setIsAutoPlay(true), 10000);
    };

    return { activeIndex, goToSlide, nextSlide, prevSlide };
}