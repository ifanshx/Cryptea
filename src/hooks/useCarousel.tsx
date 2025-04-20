// hooks/useCarousel.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for carousel behavior with autoplay and manual controls.
 * @param length Total number of slides.
 * @param autoPlayInterval Interval between auto slides (ms).
 * @param pauseDurationAfterManual Duration to pause autoplay after manual interaction (ms).
 */
export function useCarousel(
    length: number,
    autoPlayInterval = 5000,
    pauseDurationAfterManual = 10000
) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const pauseTimeout = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Autoplay effect
    useEffect(() => {
        if (!isAutoPlay) return;
        // Start autoplay interval
        intervalRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % length);
        }, autoPlayInterval);

        // Cleanup on change or unmount
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAutoPlay, length, autoPlayInterval]);

    // Pause autoplay for a specified duration after manual interaction
    const pauseAutoPlay = () => {
        setIsAutoPlay(false);
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
        pauseTimeout.current = setTimeout(() => {
            setIsAutoPlay(true);
        }, pauseDurationAfterManual);
    };

    // Manual controls
    const goToSlide = (index: number) => {
        setActiveIndex(index % length);
        pauseAutoPlay();
    };

    const nextSlide = () => {
        setActiveIndex(prev => (prev + 1) % length);
        pauseAutoPlay();
    };

    const prevSlide = () => {
        setActiveIndex(prev => (prev - 1 + length) % length);
        pauseAutoPlay();
    };

    // Cleanup on component unmount
    useEffect(() => () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    }, []);

    return { activeIndex, goToSlide, nextSlide, prevSlide };
}
