// hooks/useCarousel.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for carousel behavior with autoplay and manual controls.
 * @param length Total number of slides.
 * @param autoPlayInterval Interval between auto slides (ms).
 * @param pauseDurationAfterManual Duration to pause autoplay after manual interaction (ms).
 * @param externallyPaused Pause carousel externally (e.g. when modal is open).
 */
export function useCarousel(
    length: number,
    autoPlayInterval = 5000,
    pauseDurationAfterManual = 10000,
    externallyPaused = false
) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const pauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset activeIndex if length shrinks below current index
    useEffect(() => {
        if (activeIndex >= length && length > 0) {
            setActiveIndex(0);
        }
    }, [length, activeIndex]);

    // Autoplay effect
    useEffect(() => {
        // Do not autoplay if paused manually or externally
        if (!isAutoPlay || externallyPaused || length === 0) return;

        intervalRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % length);
        }, autoPlayInterval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isAutoPlay, externallyPaused, length, autoPlayInterval]);

    const pauseAutoPlay = () => {
        // Skip pause if externally controlled
        if (externallyPaused) return;
        setIsAutoPlay(false);
        if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
        pauseTimeout.current = setTimeout(() => {
            setIsAutoPlay(true);
        }, pauseDurationAfterManual);
    };

    const goToSlide = (index: number) => {
        // clamp index within bounds
        const i = length > 0 ? index % length : 0;
        setActiveIndex(i);
        pauseAutoPlay();
    };

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % length);
        pauseAutoPlay();
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + length) % length);
        pauseAutoPlay();
    };

    // Cleanup on unmount
    useEffect(
        () => () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
        },
        []
    );

    return { activeIndex, goToSlide, nextSlide, prevSlide, setIsAutoPlay };
}
