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
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      {/* Main Carousel */}
      <div className="relative rounded-xl overflow-hidden group">
        <div className="relative h-60 md:h-80 transition-all duration-500">
          <img
            src={carouselImages[activeIndex]}
            alt="Banner"
            className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
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
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="max-w-2xl mx-auto px-4"> {/* Container pembatas dan padding */}
          <div className="flex justify-center space-x-4"> {/* Flex tengah dengan spacing */}
            {carouselImages.map((src, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`flex-shrink-0 w-48 h-28 rounded-lg overflow-hidden border-2 transition-all ${idx === activeIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
              >
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Collection Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Trending Collection</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Floor</th>
                <th className="px-4 py-2">24h Volume</th>
                <th className="px-4 py-2">Total Volume</th>
                <th className="px-4 py-2">Owners</th>
                <th className="px-4 py-2">Supply</th>
              </tr>
            </thead>
            <tbody>
              {trendingCollections.map((col, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center space-x-3">
                    <img src={col.avatar} alt={col.name} className="w-8 h-8 rounded-full" />
                    <span className="font-medium">{col.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>{col.floor}</div>
                    <div className="text-sm text-green-500">{col.floorChange}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{col.volume24}</div>
                    <div className="text-sm text-green-500">{col.volume24Change}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{col.totalVolume}</div>
                    <div className={`text-sm ${col.totalVolumeChange.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                      {col.totalVolumeChange}
                    </div>
                  </td>
                  <td className="px-4 py-3">{col.owners.toLocaleString()}</td>
                  <td className="px-4 py-3">{col.supply.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}