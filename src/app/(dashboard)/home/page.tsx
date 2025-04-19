// app/home/page.tsx
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
    <div className="space-y-8 px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Main Carousel */}
      <div className="relative rounded-xl overflow-hidden group">
        <div className="relative h-40 sm:h-56 md:h-72 lg:h-80 transition-all duration-500">
          <img
            src={carouselImages[activeIndex]}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30" />


          {/* Slide Info */}
          <div className="absolute bottom-4 left-6">
            <h2 className="text-3xl font-bold text-white">SEALS</h2>
            <span className="inline-block mt-1 bg-green-500 text-white rounded-full px-3 py-1 text-sm">Live</span>
          </div>
          <button className="absolute bottom-4 right-6 bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">
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
              className={`
                flex-shrink-0 w-32 sm:w-40 md:w-48 h-20 sm:h-24 md:h-28
                rounded-lg overflow-hidden border-2 transition-all
                ${idx === activeIndex ? 'border-blue-500' : 'border-transparent'}
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

      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h3 className="text-xl font-semibold mb-4">Trending Collection</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Floor</th>
                <th className="px-4 py-2">24h Volume</th>
                <th className="px-4 py-2">Total Volume</th>
                <th className="px-4 py-2 hidden sm:table-cell">Owners</th>
                <th className="px-4 py-2 hidden lg:table-cell">Supply</th>
              </tr>
            </thead>
            <tbody>
              {trendingCollections.map((col, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center space-x-3">
                    <img src={col.avatar} className="w-8 h-8 rounded-full" />
                    <span className="font-medium">{col.name}</span>
                  </td>
                  <td className="px-4 py-3">{col.floor} <div className="text-sm text-green-500">{col.floorChange}</div></td>
                  <td className="px-4 py-3">{col.volume24} <div className="text-sm text-green-500">{col.volume24Change}</div></td>
                  <td className="px-4 py-3">{col.totalVolume} <div className={`text-sm ${col.totalVolumeChange.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{col.totalVolumeChange}</div></td>
                  <td className="px-4 py-3 hidden sm:table-cell">{col.owners.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{col.supply.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}