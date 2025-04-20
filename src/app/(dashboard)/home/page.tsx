'use client';
import MintPopup from '@/components/MintPopup';
import { useCarousel } from '@/hooks/useCarousel';
import React, { useState } from 'react';

const carouselImages = [
  {
    name: 'Seals',
    image: '/images/banner1.png',
    status: 'Live',
    button: 'Mint Collection',
    openseaSlug: 'steamland',
    price: '0.1 TEA',
  },
  {
    name: 'Tea in The House',
    image: '/images/banner2.png',
    status: 'Finish',
    button: 'Market',
    openseaSlug: 'tea-in-the-house',
    price: '0.2 TEA',
  },
  {
    name: 'Pink is Love',
    image: '/images/banner3.png',
    status: 'Live Generate',
    button: 'Mint Collection',
    openseaSlug: 'pink-is-love',
    price: '0.15 TEA',
  }
];

const trendingCollections = [
  {
    name: 'Steamland',
    floor: '1 TEA',
    floorChange: '+37.23%',
    volume24: '24 TEA',
    volume24Change: '+7.23%',
    totalVolume: '2,134 TEA',
    totalVolumeChange: '-1.03%',
    owners: 2174,
    supply: 2222,
    avatar: '/assets/EtherealEntities.png',
  },
  {
    name: 'Tea in The House',
    floor: '0.1 TEA',
    floorChange: '+37.23%',
    volume24: '11.24 TEA',
    volume24Change: '+7.23%',
    totalVolume: '102 TEA',
    totalVolumeChange: '-1.03%',
    owners: 512,
    supply: 1001,
    avatar: '/assets/rabbits.png',
  },
];





export default function HomePage() {
  const { activeIndex, goToSlide, setIsAutoPlay } = useCarousel(carouselImages.length);
  const [showMintPopup, setShowMintPopup] = useState(false);
  const currentSlide = carouselImages[activeIndex];

  const handleOpenMint = () => {
    setIsAutoPlay(false); // stop autoplay
    setShowMintPopup(true);
  };

  const handleCloseMint = () => {
    setShowMintPopup(false);
    setIsAutoPlay(true); // resume autoplay
  };

  const statusLower = currentSlide.status.toLowerCase();


  return (
    <div className="space-y-8 container mx-auto px-4 py-12 max-w-7xl bg-gray-50 text-gray-800">
      {/* Main Carousel */}
      <div className="relative rounded-xl overflow-hidden group shadow-lg">
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 transition-all duration-500">
          <img
            src={currentSlide.image}
            alt={currentSlide.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-40" />

          {/* Slide Info */}
          <div className="absolute bottom-6 left-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">{currentSlide.name}</h2>
            <span
              className={
                `inline-block mt-2 rounded-full px-3 md:px-4 py-1 text-sm md:text-base font-medium ` +
                (statusLower.includes('live')
                  ? 'bg-green-500/30 text-green-200'
                  : 'bg-gray-500/30 text-gray-200')
              }
            >
              {currentSlide.status}
            </span>
          </div>

          {/* Action Button */}
          {statusLower === 'live' ? (
            <button
              onClick={handleOpenMint}
              className="absolute bottom-6 right-8 bg-white/20 text-white px-4 md:px-5 py-2 rounded-full hover:bg-white/30 transition-colors shadow-md text-sm md:text-base"
            >
              {currentSlide.button}
            </button>
          ) : statusLower === 'live generate' ? (
            <button
              onClick={() => window.location.href = '/generate'} // atau router.push('/market')
              className="absolute bottom-6 right-8 bg-white/20 text-white px-4 md:px-5 py-2 rounded-full hover:bg-white/30 transition-colors shadow-md text-sm md:text-base"
            >
              {currentSlide.button}
            </button>
          ) : (
            <button
              onClick={() =>
                window.open(
                  `https://opensea.io/collection/${currentSlide.openseaSlug}`,
                  '_blank'
                )
              }
              className="absolute bottom-6 right-8 bg-white/20 text-white px-4 md:px-5 py-2 rounded-full hover:bg-white/30 transition-colors shadow-md text-sm md:text-base"
            >
              {currentSlide.button}
            </button>
          )}
        </div>
      </div>
      {/* Mint Popup */}
      {showMintPopup && <MintPopup slide={currentSlide} onClose={handleCloseMint} />}

      {/* Thumbnail Carousel */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="w-max mx-auto flex space-x-4 px-4">
          {carouselImages.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={
                `flex-shrink-0 w-24 h-15 sm:w-44 sm:h-28 md:h-32 md:w-96 rounded-lg overflow-hidden border-4 transition-all ` +
                (idx === activeIndex ? 'bg-white/20' : 'border-transparent')
              }
            >
              <img
                src={slide.image}
                alt={slide.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900">Trending Collection</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-gray-700">Name</th>
                <th className="px-6 py-3 text-gray-700">Floor</th>
                <th className="px-6 py-3 text-gray-700">24h Volume</th>
                <th className="px-6 py-3 text-gray-700">Total Volume</th>
                <th className="px-6 py-3 text-gray-700 hidden sm:table-cell">Owners</th>
                <th className="px-6 py-3 text-gray-700 hidden lg:table-cell">Supply</th>
              </tr>
            </thead>
            <tbody>
              {trendingCollections.map((col, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-100">
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <img src={col.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt={col.name} />
                    <span className="font-medium text-gray-900">{col.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {col.floor}
                    <div className="text-sm text-green-600">{col.floorChange}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {col.volume24}
                    <div className="text-sm text-green-600">{col.volume24Change}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {col.totalVolume}
                    <div className={`${col.totalVolumeChange.startsWith('-') ? 'text-red-600' : 'text-green-600'} text-sm`}>{col.totalVolumeChange}</div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-gray-800">{col.owners.toLocaleString()}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-gray-800">{col.supply.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
