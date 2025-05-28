// app/(routes)/page.tsx
"use client"; // Pastikan ini ada di baris pertama
import React, { useState, useCallback, useMemo, useEffect } from "react";
import MintPopup from "@/components/MintPopup";
import { useCarousel } from "@/hooks/useCarousel";
import GeneratePopup from "@/components/GeneratePopup";

// Local Enum dan Types
enum Status {
  LIVE = "Live",
  FINISH = "Finish",
  LIVE_GENERATE = "Live Generate",
  COMING_SOON = "Coming Soon",
}

interface CarouselSlide {
  name: string;
  image: string;
  status: Status;
  button: string;
  openseaSlug: string;
  price: string;
  assetFolder: string;
}

interface TrendingCollection {
  name: string;
  floor: string;
  floorChange: string;
  volume24: string;
  volume24Change: string;
  totalVolume: string;
  totalVolumeChange: string;
  owners: number;
  supply: number;
  avatar: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    name: "Herbivores",
    image: "/images/banner.png",
    status: Status.LIVE_GENERATE,
    button: "Mint Collection",
    openseaSlug: "Herbivores",
    assetFolder: "Herbivores",
    price: "2",
  },
  {
    name: "Tea in The House",
    image: "/images/comingsoon.png",
    status: Status.COMING_SOON,
    button: "Coming Soon",
    openseaSlug: "tea-in-the-house",
    assetFolder: "tea-in-the-house",
    price: "0.2",
  },
  {
    name: "Ethereal Entities",
    image: "/images/comingsoon.png",
    status: Status.COMING_SOON,
    button: "Coming Soon",
    openseaSlug: "etehereal-entities",
    assetFolder: "EtherealEntities",
    price: "0.15",
  },
  
];

const HomePage = () => {
  const [openPopup, setOpenPopup] = useState<"mint" | "generate" | null>(null);
  const [trendingCollections, setTrendingCollections] = useState<TrendingCollection[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(true);
  const [errorTrending, setErrorTrending] = useState<string | null>(null);

  const visibleSlides = useMemo(
    () => CAROUSEL_SLIDES.filter((slide) => slide.status !== Status.COMING_SOON),
    []
  );

  const { activeIndex, goToSlide, setIsAutoPlay } = useCarousel(
    visibleSlides.length,
    5000,
    10000,
    openPopup !== null
  );

  const currentSlide = visibleSlides[activeIndex];

  const handleClosePopup = useCallback(() => {
    setOpenPopup(null);
    setIsAutoPlay(true);
  }, [setIsAutoPlay]);

  const getButtonAction = useCallback(() => {
    if (!currentSlide) return () => { };

    switch (currentSlide.status) {
      case Status.LIVE:
        return () => {
          setIsAutoPlay(false);
          setOpenPopup("mint");
        };
      case Status.LIVE_GENERATE:
        return () => {
          setIsAutoPlay(false);
          setOpenPopup("generate");
        };
      case Status.COMING_SOON:
      case Status.FINISH:
      default:
        return () => console.log(`Collection ${currentSlide.name} is ${currentSlide.status}.`);
    }
  }, [currentSlide, setIsAutoPlay]);

  const handleThumbnailClick = useCallback(
    (slide: CarouselSlide) => {
      if (slide.status !== Status.COMING_SOON) {
        const idx = visibleSlides.findIndex(
          (s) => s.openseaSlug === slide.openseaSlug
        );
        if (idx !== -1) {
          goToSlide(idx);
        }
      }
    },
    [visibleSlides, goToSlide]
  );

  const getChangeColorClass = useCallback((change: string) => {
    if (change.startsWith("+")) return "text-green-500 dark:text-green-400";
    if (change.startsWith("-")) return "text-red-500 dark:text-red-400";
    return "text-gray-600 dark:text-gray-300";
  }, []);

  // --- Start: Penambahan untuk fetching data trending collections (Sama seperti sebelumnya) ---
  const fetchTrendingCollections = useCallback(async () => {
    setIsLoadingTrending(true);
    setErrorTrending(null);
    try {
      // Panggil API Route yang baru dibuat di App Router
      const response = await fetch("/api/trending-collections");
      if (!response.ok) {
        throw new Error(`Failed to fetch trending collections: ${response.statusText}`);
      }
      const data: TrendingCollection[] = await response.json();
      setTrendingCollections(data);
    } catch (err: unknown) {
      console.error("Error fetching trending collections:", err);
      if (err instanceof Error) {
        setErrorTrending(err.message);
      } else {
        setErrorTrending("Failed to load trending collections.");
      }
    } finally {
      setIsLoadingTrending(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingCollections();
    const interval = setInterval(fetchTrendingCollections, 5 * 60 * 1000); // Refresh setiap 5 menit
    return () => clearInterval(interval);
  }, [fetchTrendingCollections]);
  // --- End: Penambahan untuk fetching data trending collections ---

  if (!currentSlide) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-500">
        Loading carousel data...
      </div>
    );
  }

  return (
    <div className="space-y-10 container mx-auto px-4 py-8 max-w-7xl">
      {/* Main Carousel Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500 ease-in-out">
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[450px] flex items-end">
          <img
            src={currentSlide.image}
            alt={`${currentSlide.name} collection banner`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-end w-full">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-2 leading-tight">
                {currentSlide.name}
              </h2>
              <span
                className={`inline-block mt-2 rounded-full px-4 py-1 text-base md:text-lg font-semibold ${currentSlide.status === Status.LIVE_GENERATE || currentSlide.status === Status.LIVE
                  ? "bg-teal-600/70 text-white shadow-md"
                  : "bg-gray-600/70 text-gray-200 shadow-md"
                  }`}
              >
                {currentSlide.status}
              </span>
            </div>
            <button
              onClick={getButtonAction()}
              disabled={currentSlide.status === Status.COMING_SOON || currentSlide.status === Status.FINISH}
              className={`mt-4 sm:mt-0 px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg
                                ${currentSlide.status === Status.LIVE_GENERATE || currentSlide.status === Status.LIVE
                  ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 focus:ring-4 focus:ring-teal-400"
                  : "bg-gray-400 text-gray-800 cursor-not-allowed opacity-70"
                }`}
            >
              {currentSlide.button}
            </button>
          </div>
        </div>
        {openPopup === "mint" && (
          <MintPopup slide={currentSlide} onClose={handleClosePopup} />
        )}
        {openPopup === "generate" && (
          <GeneratePopup slide={currentSlide} onClose={handleClosePopup} />
        )}
      </section>

      {/* Thumbnail Carousel Section */}
      <section className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="w-max mx-auto flex space-x-4 px-2 sm:px-0">
          {CAROUSEL_SLIDES.map((slide) => {
            const isActive = currentSlide && slide.openseaSlug === currentSlide.openseaSlug;
            const isDisabled = slide.status === Status.COMING_SOON || slide.status === Status.FINISH;

            return (
              <button
                key={slide.openseaSlug}
                onClick={() => handleThumbnailClick(slide)}
                disabled={isDisabled}
                className={`relative flex-shrink-0 w-24 h-15 sm:w-44 sm:h-28 md:h-32 md:w-90 rounded-xl overflow-hidden border-4 transition-all duration-300 transform hover:scale-[1.02]
                                ${isActive
                    ? "border-teal-500 shadow-xl ring-2 ring-teal-500/50"
                    : "border-gray-700/50 hover:border-teal-400/50"
                  }
                                ${isDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
                aria-label={`View ${slide.name} collection`}
              >
                <img
                  src={slide.image}
                  alt={slide.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${isDisabled ? "filter blur-[2px]" : ""
                    }`}
                  loading="lazy"
                />
                {isDisabled && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-sm sm:text-base font-extrabold text-white text-center">
                      {slide.status === Status.COMING_SOON ? "Coming Soon" : "Finished"}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Trending Collection Table */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
          🔥 Trending Collections
        </h3>
        <div className="overflow-x-auto scrollbar-thin">
          {isLoadingTrending ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-lg">
              Loading trending collections...
            </div>
          ) : errorTrending ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400 text-lg">
              Error: {errorTrending}
              <br />
              Please try again later.
            </div>
          ) : (
            <table className="min-w-full text-left table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm sm:text-base uppercase tracking-wider">
                  <th className="px-4 py-3 sm:px-6">Collection</th>
                  <th className="px-4 py-3 sm:px-6">Floor Price</th>
                  <th className="px-4 py-3 sm:px-6">24h Volume</th>
                  <th className="px-4 py-3 sm:px-6 hidden md:table-cell">Total Volume</th>
                  <th className="px-4 py-3 sm:px-6 hidden sm:table-cell">Owners</th>
                  <th className="px-4 py-3 sm:px-6 hidden lg:table-cell">Supply</th>
                </tr>
              </thead>
              <tbody>
                {trendingCollections.length > 0 ? (
                  trendingCollections.map((col, index) => (
                    <tr
                      key={col.name}
                      className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-850"
                        }`}
                    >
                      <td className="px-4 py-4 sm:px-6 flex items-center space-x-3">
                        <img
                          src={col.avatar}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                          alt={`${col.name} avatar`}
                        />
                        <span className="font-semibold text-gray-900 dark:text-white text-base">
                          {col.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 sm:px-6 text-gray-800 dark:text-gray-200 font-medium">
                        {col.floor}
                        <div className={`text-xs ${getChangeColorClass(col.floorChange)}`}>
                          {col.floorChange}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 text-gray-800 dark:text-gray-200 font-medium">
                        {col.volume24}
                        <div className={`text-xs ${getChangeColorClass(col.volume24Change)}`}>
                          {col.volume24Change}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 hidden md:table-cell text-gray-800 dark:text-gray-200 font-medium">
                        {col.totalVolume}
                        <div className={`text-xs ${getChangeColorClass(col.totalVolumeChange)}`}>
                          {col.totalVolumeChange}
                        </div>
                      </td>
                      <td className="px-4 py-4 sm:px-6 hidden sm:table-cell text-gray-800 dark:text-gray-200">
                        {col.owners.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 sm:px-6 hidden lg:table-cell text-gray-800 dark:text-gray-200">
                        {col.supply.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400 text-lg">
                      No trending collections available at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Custom CSS for scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: theme('colors.gray.200');
          border-radius: 10px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-track {
          background: theme('colors.gray.800');
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: theme('colors.teal.500');
          border-radius: 10px;
          border: 2px solid theme('colors.gray.200');
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: theme('colors.teal.600');
          border-color: theme('colors.gray.800');
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: theme('colors.teal.600');
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: theme('colors.teal.500');
        }
      `}</style>
    </div>
  );
};

export default HomePage;