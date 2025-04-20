import React from 'react';
import Image from 'next/image';

// Dummy data — sesuaikan dengan sumber data asli
const collections = [
  { name: 'Seals', image: '/assets/EtherealEntities.png', staked: 3, total: 3 },
  { name: 'Pink is Love', image: '/assets/rabbits.png', staked: 1, total: 5 },
];

const leaderboard = [
  { address: '0x32...A5C4', avatar: '/assets/EtherealEntities.png', amount: 200_000 },
  { address: '0x32...A5C4', avatar: '/assets/rabbits.png', amount: 20_000 },
  { address: '0x32...A5C4', avatar: '/assets/EtherealEntities.png', amount: 2_000 },
  { address: '0x32...A5C4', avatar: '/assets/rabbits.png', amount: 1_000 },
  { address: '0x32...A5C4', avatar: '/assets/EtherealEntities.png', amount: 900 },
  { address: '0x32...A5C4', avatar: '/assets/rabbits.png', amount: 500 },
  { address: '0x32...A5C4', avatar: '/assets/EtherealEntities.png', amount: 60 },
  { address: 'You', avatar: '/assets/EtherealEntities.png', amount: 7 },
];

export default function StakePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Section */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
            Earn rewards with your digital assets
          </h1>

          {/* NFT Collection Cards */}
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
            {collections.map((col, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 min-w-[12rem] sm:min-w-[14rem] md:min-w-[16rem] bg-white rounded-2xl shadow p-4 text-center"
              >
                <div className="w-full h-40 relative rounded-xl overflow-hidden mb-3">
                  <Image
                    src={col.image}
                    alt={col.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
                <h2 className="font-medium text-lg text-gray-900">{col.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {col.staked}/{col.total} NFT{col.total > 1 ? 's' : ''} Staked
                </p>
              </div>
            ))}
          </div>

          {/* Stake & Rewards Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
              <span className="text-gray-500 text-sm">Stake Overview</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">4 NFT</span>
              <button className="mt-4 bg-black text-white rounded-full px-8 py-2 hover:opacity-90 transition">
                Stake
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
              <span className="text-gray-500 text-sm">Rewards Overview</span>
              <span className="text-3xl font-bold text-gray-900 mt-2">7 CTEA</span>
              <button className="mt-4 bg-black text-white rounded-full px-8 py-2 hover:opacity-90 transition">
                Claim
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Leaderboard</h2>
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center px-4 py-3 transition 
                  ${entry.address === 'You' ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center space-x-3 truncated">
                  <span className="font-medium w-6">{idx + 1}.</span>
                  <div className="w-8 h-8 relative rounded-full overflow-hidden">
                    <Image
                      src={entry.avatar}
                      alt={entry.address}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <span className="text-sm sm:text-base truncate max-w-[8rem]">
                    {entry.address}
                  </span>
                </div>
                <span className="font-semibold text-sm sm:text-base">
                  {entry.amount.toLocaleString()} CTEA
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}