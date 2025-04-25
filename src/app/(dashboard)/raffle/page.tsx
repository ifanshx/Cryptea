'use client';
import { Ticket, Clock } from 'lucide-react';

import React from 'react';

const raffleNFTs = [
  {
    id: 1,
    name: 'Golden Steamland',
    image: '/assets/EtherealEntities.png',
    ticketPrice: '0.5 TEA',
    totalTickets: 100,
    remainingTickets: 34,
    endTime: '2024-03-15T23:59:59',
  },
  {
    id: 2,
    name: 'Midnight Tea House',
    image: '/assets/rabbits.png',
    ticketPrice: '0.3 TEA',
    totalTickets: 200,
    remainingTickets: 89,
    endTime: '2024-03-18T12:00:00',
  },
  {
    id: 3,
    name: 'Pink Nebula',
    image: '/assets/EtherealEntities.png',
    ticketPrice: '1.2 TEA',
    totalTickets: 50,
    remainingTickets: 12,
    endTime: '2024-03-20T18:30:00',
  },
];

export default function RafflePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl bg-gray-50 min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">NFT Raffles</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Participate in exclusive NFT raffles for a chance to win unique digital collectibles.
          Purchase tickets and wait for the lucky draw!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {raffleNFTs.map((nft) => (
          <div
            key={nft.id}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
          >
            {/* NFT Image */}
            <div className="relative aspect-square">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Countdown Timer */}
              <div className="absolute top-4 right-4 bg-black/30 px-3 py-1 rounded-full flex items-center text-white text-sm">
                <Clock className="w-4 h-4 mr-2" />
                <span>2d 14h left</span>
              </div>
            </div>

            {/* Raffle Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{nft.name}</h3>

              {/* Ticket Info */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Price:</span>
                  <span className="font-semibold text-gray-900">{nft.ticketPrice}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tickets Remaining:</span>
                  <span className="font-semibold text-gray-900">
                    {nft.remainingTickets}/{nft.totalTickets}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-200 rounded-full mb-4">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${((nft.totalTickets - nft.remainingTickets) / nft.totalTickets) * 100}%`,
                  }}
                />
              </div>

              {/* Participation Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <button className="text-gray-900 hover:text-blue-600">-</button>
                  <span className="w-8 text-center">1</span>
                  <button className="text-gray-900 hover:text-blue-600">+</button>
                </div>

                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full flex items-center transition-all">
                  <Ticket className="w-5 h-5 mr-2" />
                  Participate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works Section */}
      <div className="mt-16 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Buy Tickets</h3>
            <p className="text-gray-600">Purchase tickets for the NFT you want to win</p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Wait for Draw</h3>
            <p className="text-gray-600">The raffle will end once all tickets are sold</p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Claim Prize</h3>
            <p className="text-gray-600">Winner will be randomly selected and notified</p>
          </div>
        </div>
      </div>
    </div>
  );
}