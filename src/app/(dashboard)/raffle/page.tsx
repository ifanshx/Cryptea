'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Ticket } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// Interface untuk data NFT Raffle
interface RaffleNFT {
  id: number;
  name: string;
  image: string;
  price: string;
  totalTickets: number;
  ticketsSold: number;
  endTime: string;
}

// Data dummy untuk NFT Raffle (ditambahkan beberapa untuk demonstrasi scrolling)
const raffleNFTs: RaffleNFT[] = [
  { id: 1, name: 'PockeT Monsters 2.0 #611', image: '/raffle1.png', price: '7 $CTEA', totalTickets: 12000, ticketsSold: 100, endTime: '2025-06-01T12:00:00Z' },
  { id: 2, name: 'PockeT Monsters 2.0 #131', image: '/raffle2.png', price: '7 $CTEA', totalTickets: 12000, ticketsSold: 7500, endTime: '2025-06-01T12:00:00Z' },
  { id: 3, name: 'PockeT Monsters 2.0 #123', image: '/raffle3.png', price: '7 $CTEA', totalTickets: 11950, ticketsSold: 11950, endTime: '2021-06-01T12:00:00Z' },
  { id: 4, name: 'PockeT Monsters 2.0 #456', image: '/raffle1.png', price: '7 $CTEA', totalTickets: 10000, ticketsSold: 500, endTime: '2025-07-15T10:00:00Z' },
  { id: 5, name: 'PockeT Monsters 2.0 #789', image: '/raffle2.png', price: '7 $CTEA', totalTickets: 15000, ticketsSold: 12000, endTime: '2025-08-01T14:00:00Z' },
  { id: 6, name: 'PockeT Monsters 2.0 #001', image: '/raffle3.png', price: '7 $CTEA', totalTickets: 8000, ticketsSold: 1000, endTime: '2025-09-20T16:00:00Z' },
];

// Fungsi untuk memformat sisa waktu (real-time)
function formatTimeLeft(endTime: string): { display: string; ended: boolean } {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = Math.max(end - now, 0);

  if (diff === 0) {
    return { display: "Raffle Ended", ended: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (days > 0) {
    return { display: `${days}d ${hours}h left`, ended: false };
  } else if (hours > 0) {
    return { display: `${hours}h ${minutes}m left`, ended: false };
  } else if (minutes > 0) {
    return { display: `${minutes}m ${seconds}s left`, ended: false };
  } else {
    return { display: `${seconds}s left`, ended: false };
  }
}

// *** KONSTAN UNTUK PESAN TOAST ***
const TOAST_MESSAGES = {
  SELECT_TICKETS: "Please select at least 1 ticket to buy.",
  RAFFLE_ENDED: "This raffle has ended and is no longer active.",
  SOLD_OUT: "This raffle is sold out! Please check back later or try another.",
  PURCHASE_SUCCESS: (quantity: number, nftName: string) => `Successfully added ${quantity} ticket(s) for ${nftName} to your cart. (Placeholder)`,
  PURCHASE_FAILED: "Failed to process your ticket purchase. Please try again.",
  MAX_TICKETS: (max: number) => `You cannot buy more than ${max} tickets.`,
};

export default function RafflePage() {
  const { addToast } = useToast();

  const [quantities, setQuantities] = useState<number[]>(() => raffleNFTs.map(() => 0));
  const [timeRemaining, setTimeRemaining] = useState<
    { display: string; ended: boolean }[]
  >(() => raffleNFTs.map(nft => formatTimeLeft(nft.endTime)));

  useEffect(() => {
    const intervals = raffleNFTs.map((nft, idx) =>
      setInterval(() => {
        setTimeRemaining(prev => {
          const newTimes = [...prev];
          newTimes[idx] = formatTimeLeft(nft.endTime);
          return newTimes;
        });
      }, 1000)
    );

    return () => intervals.forEach(clearInterval);
  }, []);

  const increment = useCallback((idx: number): void => {
    setQuantities((q: number[]) => {
      const newQuantities = [...q];
      const currentNFT = raffleNFTs[idx];
      const ticketsAvailable = currentNFT.totalTickets - currentNFT.ticketsSold;
      const { ended: raffleEnded } = formatTimeLeft(currentNFT.endTime);

      if (raffleEnded) {
        addToast({ message: TOAST_MESSAGES.RAFFLE_ENDED, type: "error" });
        return q;
      }
      if (ticketsAvailable <= 0) {
        addToast({ message: TOAST_MESSAGES.SOLD_OUT, type: "error" });
        return q;
      }

      if (newQuantities[idx] < ticketsAvailable) {
        newQuantities[idx] += 1;
      } else {
        addToast({ message: TOAST_MESSAGES.MAX_TICKETS(ticketsAvailable), type: "warning" });
      }
      return newQuantities;
    });
  }, [addToast]);

  const decrement = useCallback((idx: number): void => {
    setQuantities((q: number[]) => {
      const newQuantities = [...q];
      if (newQuantities[idx] > 0) {
        newQuantities[idx] -= 1;
      }
      return newQuantities;
    });
  }, []);

  const handleBuyTicket = useCallback((nftId: number, quantity: number, raffleStatus: { display: string; ended: boolean }, isSoldOut: boolean) => {
    const currentNFT = raffleNFTs.find(n => n.id === nftId);
    if (!currentNFT) return;

    if (quantity === 0) {
      addToast({ message: TOAST_MESSAGES.SELECT_TICKETS, type: "error" });
      return;
    }
    if (raffleStatus.ended) {
      addToast({ message: TOAST_MESSAGES.RAFFLE_ENDED, type: "error" });
      return;
    }
    if (isSoldOut) {
      addToast({ message: TOAST_MESSAGES.SOLD_OUT, type: "error" });
      return;
    }

    console.log(`Buying ${quantity} tickets for NFT ID: ${nftId}`);
    addToast({ message: TOAST_MESSAGES.PURCHASE_SUCCESS(quantity, currentNFT.name), type: "success" });

    setQuantities(prev => prev.map((q, i) => (raffleNFTs[i].id === nftId ? 0 : q)));
  }, [addToast]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Container utama untuk scrolling horizontal */}
      {/* Tambahkan kelas 'hide-scrollbar' di sini */}
      <div className="max-w-7xl mx-auto flex overflow-x-auto pb-4 hide-scrollbar">
        {raffleNFTs.map((nft, idx) => {
          const { display: timeLeftDisplay, ended: raffleEnded } = timeRemaining[idx];
          const ticketsAvailable = nft.totalTickets - nft.ticketsSold;
          const progressPercentage = (nft.ticketsSold / nft.totalTickets) * 100;
          const isSoldOut = ticketsAvailable <= 0;
          const canBuy = quantities[idx] > 0 && !raffleEnded && !isSoldOut;

          return (
            <div key={nft.id} className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden mx-3">
              {/* Image + Timer */}
              <div className="relative">
                <img src={nft.image} alt={nft.name} className="w-full h-auto object-cover" />
                <div className={`absolute left-1/2 bottom-4 transform -translate-x-1/2 flex items-center px-3 py-1 rounded-full ${raffleEnded ? 'bg-red-500/70' : 'bg-gradient-to-r from-gray-200/70 to-gray-300/70'} `}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${raffleEnded ? 'bg-white' : 'bg-green-400'}`} />
                  <span className={`text-sm font-medium ${raffleEnded ? 'text-white' : 'text-gray-900'}`}>{timeLeftDisplay}</span>
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
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="mt-1 font-medium text-gray-900">{nft.totalTickets.toLocaleString()}</span>
                  </div>
                  <div className="border-l border-gray-300" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500">Sold</span>
                    <span className="mt-1 font-medium text-gray-900">{nft.ticketsSold.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5 mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}% Sold</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">
                    {isSoldOut ? "Sold Out!" : `${ticketsAvailable.toLocaleString()} tickets remaining`}
                  </p>
                </div>


                {/* Purchase Controls */}
                <div className="mt-6 ">
                  <div className="flex items-center justify-between mb-4">
                    {/* Stepper */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => decrement(idx)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantities[idx] === 0 || raffleEnded || isSoldOut}
                      >
                        –
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">
                        {quantities[idx]}
                      </span>
                      <button
                        onClick={() => increment(idx)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={raffleEnded || isSoldOut || quantities[idx] >= ticketsAvailable}
                      >
                        +
                      </button>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuyTicket(nft.id, quantities[idx], timeRemaining[idx], isSoldOut)}
                      className={`ml-4 flex-1 py-2 rounded-full flex items-center justify-center transition ${canBuy
                        ? 'bg-teal-500 hover:bg-teal-600 text-white'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                      disabled={!canBuy}
                    >
                      <Ticket className="w-5 h-5 mr-2" />
                      Buy Ticket
                    </button>
                  </div>

                  {/* Link to Participants */}
                  <p className="text-center text-xs text-gray-500">
                    <a
                      href={`/raffle/${nft.id}/participants`}
                      className="text-teal-600 hover:text-teal-800 transition"
                    >
                      See Participants
                    </a>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}