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
    pauseDurationAfterManual = 10000,
    externallyPaused = false // Tambahkan parameter ini
) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const pauseTimeout = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isAutoPlay || externallyPaused) return; // Tambahkan pengecekan externallyPaused

        intervalRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % length);
        }, autoPlayInterval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAutoPlay, externallyPaused, length, autoPlayInterval]);

    const pauseAutoPlay = () => {
        if (externallyPaused) return; // skip pausing if external pause is on
        setIsAutoPlay(false);
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
        pauseTimeout.current = setTimeout(() => {
            setIsAutoPlay(true);
        }, pauseDurationAfterManual);
    };

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

    useEffect(() => () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    }, []);

    return { activeIndex, goToSlide, nextSlide, prevSlide, setIsAutoPlay };
}
