"use client";
import React, { useEffect, useState, useCallback } from "react";
import MintPopup from "@/components/MintPopup";
import { useCarousel } from "@/hooks/useCarousel";

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
    status: Status.LIVE,
    button: "Mint Collection",
    openseaSlug: "Herbivores",
    price: "0.10 TEA",
  },
  {
    name: "Tea in The House",
    image: "/images/banner2.png",
    status: Status.COMING_SOON,
    button: "Coming Soon",
    openseaSlug: "tea-in-the-house",
    price: "0.20 TEA",
  },
  {
    name: "Pink is Love",
    image: "/images/banner3.png",
    status: Status.COMING_SOON,
    button: "Coming Soon",
    openseaSlug: "pink-is-love",
    price: "0.15 TEA",
  },
];

const TRENDING_COLLECTIONS: TrendingCollection[] = [
  {
    name: "Steamland",
    floor: "1 TEA",
    floorChange: "+37.23%",
    volume24: "24 TEA",
    volume24Change: "+7.23%",
    totalVolume: "2,134 TEA",
    totalVolumeChange: "-1.03%",
    owners: 2174,
    supply: 2222,
    avatar: "/assets/EtherealEntities.png",
  },
  {
    name: "Tea in The House",
    floor: "0.1 TEA",
    floorChange: "+37.23%",
    volume24: "11.24 TEA",
    volume24Change: "+7.23%",
    totalVolume: "102 TEA",
    totalVolumeChange: "-1.03%",
    owners: 512,
    supply: 1001,
    avatar: "/assets/rabbits.png",
  },
];

const HomePage = () => {
  const [showMintPopup, setShowMintPopup] = useState(false);

  // Hanya slide yang bukan Coming Soon
  const visibleSlides = CAROUSEL_SLIDES.filter(
    (slide) => slide.status !== Status.COMING_SOON
  );

  const { activeIndex, goToSlide, setIsAutoPlay } = useCarousel(
    visibleSlides.length,
    5000,
    10000,
    showMintPopup
  );

  const currentSlide = visibleSlides[activeIndex];

  useEffect(() => {
    if (activeIndex >= visibleSlides.length) {
      goToSlide(0);
    }
  }, [activeIndex, goToSlide, visibleSlides.length]);

  const handleOpenMint = useCallback(() => {
    setIsAutoPlay(false);
    setShowMintPopup(true);
  }, [setIsAutoPlay]);

  const handleCloseMint = useCallback(() => {
    setShowMintPopup(false);
    setIsAutoPlay(true);
  }, [setIsAutoPlay]);

  const getButtonAction = useCallback(() => {
    switch (currentSlide.status) {
      case Status.LIVE:
        return handleOpenMint;
      case Status.LIVE_GENERATE:
        return () => window.location.assign("/generate");
      default:
        return () => {};
    }
  }, [currentSlide, handleOpenMint]);

  // Klik thumbnail hanya untuk slide aktif
  const handleThumbnailClick = (slide: CarouselSlide) => {
    if (slide.status !== Status.COMING_SOON) {
      const idx = visibleSlides.findIndex(
        (s) => s.openseaSlug === slide.openseaSlug
      );
      if (idx >= 0) goToSlide(idx);
    }
  };

  return (
    <div className="space-y-8 container mx-auto px-1 py-1 ">
      {/* Main Carousel */}
      <div className="relative rounded-xl overflow-hidden group shadow-lg">
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 transition-all duration-500">
          <img
            src={currentSlide.image}
            alt={`${currentSlide.name} collection banner`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            loading="lazy"
          />
          <div className="absolute bottom-6 left-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
              {currentSlide.name}
            </h2>
            <span
              className={`inline-block mt-2 rounded-full px-3 md:px-4 py-1 text-sm md:text-base font-medium ${
                currentSlide.status === Status.LIVE
                  ? "bg-green-500/30 text-green-200"
                  : "bg-gray-500/30 text-gray-200"
              }`}
            >
              {currentSlide.status}
            </span>
          </div>
          <button
            onClick={getButtonAction()}
            className="absolute bottom-6 right-8 bg-white/20 text-white px-4 md:px-5 py-2 rounded-full hover:bg-white/30 transition-colors shadow-md text-sm md:text-base"
          >
            {currentSlide.button}
          </button>
        </div>
      </div>

      {showMintPopup && (
        <MintPopup slide={currentSlide} onClose={handleCloseMint} />
      )}

      {/* Thumbnail Carousel */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="w-max mx-auto flex space-x-4 px-4">
          {CAROUSEL_SLIDES.map((slide) => {
            const visibleIdx = visibleSlides.findIndex(
              (s) => s.openseaSlug === slide.openseaSlug
            );
            const isActive = visibleIdx === activeIndex;
            return (
              <button
                key={slide.openseaSlug}
                onClick={() => handleThumbnailClick(slide)}
                disabled={slide.status === Status.COMING_SOON}
                className={`relative flex-shrink-0 w-24 h-15 sm:w-44 sm:h-28 md:h-32 md:w-90 rounded-lg overflow-hidden border-4 transition-all ${
                  isActive ? "bg-white/20" : "border-transparent"
                } ${
                  slide.status === Status.COMING_SOON
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                aria-label={`View ${slide.name} collection`}
              >
                <img
                  src={slide.image}
                  alt={slide.name}
                  className={`w-full h-full object-cover transform transition-transform ${
                    slide.status === Status.COMING_SOON
                      ? "filter blur-sm"
                      : "hover:scale-105"
                  }`}
                  loading="lazy"
                />
                {slide.status === Status.COMING_SOON && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                      {Status.COMING_SOON}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900">
          Trending Collection
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-gray-700">Name</th>
                <th className="px-6 py-3 text-gray-700">Floor</th>
                <th className="px-6 py-3 text-gray-700">24h Volume</th>
                <th className="px-6 py-3 text-gray-700">Total Volume</th>
                <th className="px-6 py-3 text-gray-700 hidden sm:table-cell">
                  Owners
                </th>
                <th className="px-6 py-3 text-gray-700 hidden lg:table-cell">
                  Supply
                </th>
              </tr>
            </thead>
            <tbody>
              {TRENDING_COLLECTIONS.map((col) => (
                <tr
                  key={col.name}
                  className="border-b border-gray-100 hover:bg-gray-100"
                >
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <img
                      src={col.avatar}
                      className="w-10 h-10 rounded-full border border-gray-200"
                      alt={`${col.name} avatar`}
                    />
                    <span className="font-medium text-gray-900">
                      {col.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {col.floor}
                    <div className="text-sm text-green-600">
                      {col.floorChange}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {col.volume24}
                    <div className="text-sm text-green-600">
                      {col.volume24Change}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {col.totalVolume}
                    <div
                      className={`text-sm ${
                        col.totalVolumeChange.startsWith("-")
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {col.totalVolumeChange}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-gray-800">
                    {col.owners.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-gray-800">
                    {col.supply.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
