'use client';
import React, { useState } from 'react';
import { Ticket } from 'lucide-react';

const raffleNFTs = [
  { id: 1, name: 'PockeT Monsters 2.0 #611', image: '/raffle1.png', price: '7 $CTEA', sold: 12000, bought: 100, endTime: '2025-05-01T12:00:00Z' },
  { id: 2, name: 'PockeT Monsters 2.0 #131', image: '/raffle2.png', price: '7 $CTEA', sold: 12000, bought: 100, endTime: '2025-05-03T18:30:00Z' },
  { id: 3, name: 'PockeT Monsters 2.0 #123', image: '/raffle3.png', price: '7 $CTEA', sold: 12000, bought: 100, endTime: '2025-05-05T20:45:00Z' },
];


function formatTimeLeft(endTime: string): string {
  const diff = Math.max(new Date(endTime).getTime() - new Date().getTime(), 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h left`;
}

export default function RafflePage() {
  const [quantities, setQuantities] = useState(() => raffleNFTs.map(() => 0));

  const increment = (idx: number): void => {
    setQuantities((q: number[]) => q.map((v, i) => (i === idx ? v + 1 : v)));
  };
  const decrement = (idx: number): void => {
    setQuantities((q: number[]) => q.map((v: number, i: number) => (i === idx && v > 0 ? v - 1 : v)));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {raffleNFTs.map((nft, idx) => (
          <div key={nft.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Image + Timer */}
            <div className="relative">
              <img src={nft.image} alt={nft.name} className="w-full h-auto object-cover" />
              <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 flex items-center bg-gradient-to-r from-gray-200/70 to-gray-300/70 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                <span className="text-sm font-medium text-gray-900">{formatTimeLeft(nft.endTime)}</span>
              </div>
            </div>

            {/* Details */}
            <div className="px-5 pt-4 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 text-center">{nft.name}</h3>

              {/* Stats */}
              <div className="mt-4 bg-gray-100 rounded-2xl p-4 flex justify-between">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500">Price</span>
                  <span className="mt-1 font-medium text-gray-900">{nft.price}</span>
                </div>
                <div className="border-l border-gray-300" />
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500">Sold</span>
                  <span className="mt-1 font-medium text-gray-900">{nft.sold.toLocaleString()}</span>
                </div>
                <div className="border-l border-gray-300" />
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500">Bought</span>
                  <span className="mt-1 font-medium text-gray-900">{nft.bought}</span>
                </div>
              </div>

              {/* Purchase Controls */}
              <div className="mt-6 ">
                <div className="flex items-center justify-between mb-4">

                  {/* Stepper */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => decrement(idx)}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700"
                    >
                      –
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900">
                      {quantities[idx]}
                    </span>
                    <button
                      onClick={() => increment(idx)}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700"
                    >
                      +
                    </button>
                  </div>

                  {/* Buy Button */}
                  <button
                    className="w-full bg-teal-400 hover:bg-teal-500 text-white py-2 rounded-full flex items-center justify-center transition"
                  >
                    <Ticket className="w-5 h-5 mr-2" />
                    Buy Ticket
                  </button>

                  {/* Link to Participants */}

                </div>

                <p className="text-center text-xs text-gray-500">
                  See Participant
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
