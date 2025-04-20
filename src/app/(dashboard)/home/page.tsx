'use client';
import { useCarousel } from '@/hooks/useCarousel';
import React from 'react';

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
            <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">SEALS</h2>
            <span className="inline-block mt-2 bg-blue-500 text-white rounded-full px-4 py-1 text-sm font-medium">Live</span>
          </div>
          <button className="absolute bottom-6 right-8 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-md">
            Mint Collection
          </button>
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="w-max mx-auto flex space-x-4 px-4">
          {carouselImages.map((src, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={
                `
                flex-shrink-0 w-36 sm:w-44 md:w-52 h-24 sm:h-28 md:h-32
                rounded-lg overflow-hidden border-4 transition-all
                ${idx === activeIndex ? 'border-blue-600' : 'border-transparent'}
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
