'use client';
import { useCarousel } from '@/hooks/useCarousel';
import { SparklesIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

const carouselImages = [
  '/images/banner1.png',
  '/images/banner2.png',
  '/images/banner3.png',
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
  const { activeIndex, goToSlide } = useCarousel(carouselImages.length);
  const [showMintPopup, setShowMintPopup] = useState(false);

  const handleOpenMint = () => setShowMintPopup(true);
  const handleCloseMint = () => setShowMintPopup(false);
  return (
    <div className="space-y-8 px-4 lg:px-10 py-6 bg-gray-50 text-gray-800">
      {/* Main Carousel */}
      <div className="relative rounded-xl overflow-hidden group shadow-lg">
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 transition-all duration-500">
          <img
            src={carouselImages[activeIndex]}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-40" />

          {/* Slide Info */}
          <div className="absolute bottom-6 left-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">SEALS</h2>
            <span className="inline-block mt-2 bg-white/20 text-white rounded-full px-3 md:px-4 py-1 text-sm md:text-base font-medium">Live</span>
          </div>
          <button
            onClick={handleOpenMint}

            className="absolute cursor-pointer bottom-6 right-8 bg-white/20 text-white px-4 md:px-5 py-2 rounded-full hover:bg-white/30 transition-colors shadow-md text-sm md:text-base">
            Mint Collection
          </button>
        </div>
      </div>

      {/* Mint Popup */}
      {showMintPopup && (
        <div className="fixed inset-0  z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            style={{ backgroundImage: "url('/backgroundhome.png')" }}
            className="backdrop-blur-lg bg-cover  bg-center bg-no-repeat rounded-2xl border border-white/20 shadow-2xl max-w-md w-full animate-fade-in relative mx-2 sm:mx-4"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseMint}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/90 hover:text-white transition-colors text-xl sm:text-2xl"
            >
              ✕
            </button>

            {/* Header */}
            <div className="pt-6 sm:pt-8 px-4 sm:px-6 text-center">
              <h1 className="text-white/90 text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 [font-family:'McLaren-Regular']">
                Checkout
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6">
                Expand your digital collection with a tea!
              </p>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
              {/* Balance */}
              <div className="bg-white/10 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm sm:text-base">Your Balance:</span>
                  <span className="text-white/90 font-bold text-sm sm:text-base">12.45 TEA</span>
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm sm:text-base">Price per item</span>
                  <span className="text-white/90 font-bold text-sm sm:text-base">0.1 TEA</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-white/70 text-sm sm:text-base">Quantity</span>
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm">
                    <button className="text-white/90 hover:text-white text-base sm:text-lg">
                      -
                    </button>
                    <span className="text-white/90 font-bold mx-1 sm:mx-2 text-sm sm:text-base">1</span>
                    <button className="text-white/90 hover:text-white text-base sm:text-lg">
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Fees */}
              <div className="bg-white/10 p-3 sm:p-4 rounded-xl space-y-1 sm:space-y-2 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm sm:text-base">Platform & Gas Fee</span>
                  <span className="text-white/90 text-sm sm:text-base">0.002 TEA</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 sm:pt-4 border-t border-white/20 gap-2">
                <span className="text-white/70 text-base sm:text-lg">You will pay</span>
                <div className="text-right">
                  <div className="text-white/90 font-bold text-lg sm:text-xl">0.107 TEA</div>
                  <div className="text-white/70 text-xs sm:text-sm">≈ $1.23</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-blue-400/90 transition-all duration-300"
                  style={{ width: `42%` }}
                />
              </div>

              {/* Mint Button */}
              <button
                className="w-full bg-gradient-to-r from-blue-400/90 to-purple-400/90 hover:from-blue-500/90 hover:to-purple-500/90 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-lg">Mint</span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 sm:pt-6 px-4 sm:px-6 text-center pb-4">
              <p className="text-white/70 text-xs sm:text-sm">
                Powered by tea.xyz
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Carousel */}
      <div className="overflow-x-auto scrollbar-hide ">
        <div className="w-max mx-auto flex space-x-4 px-4">
          {carouselImages.map((src, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={
                `
                flex-shrink-0 w-24 h-15 sm:w-44 sm:h-28  md:h-32 md:w-96 
                rounded-lg overflow-hidden border-4 transition-all 
                ${idx === activeIndex ? 'bg-white/20' : 'border-transparent'}
              `}
            >
              <img
                src={src}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
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
                    <img src={col.avatar} className="w-10 h-10 rounded-full border border-gray-200" />
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
                    <div className={`text-sm ${col.totalVolumeChange.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>{col.totalVolumeChange}</div>
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
