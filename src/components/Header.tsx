// components/Header.tsx
"use client";


import { LogsIcon, Search } from 'lucide-react';


import HomeConnect from "./HomeConnect";
import { useAccount, useBalance } from "wagmi";

export default function Header({
  onMenuToggle,
  isMobile,
  sidebarOpen = false,
}: {
  onMenuToggle?: () => void;
  isMobile?: boolean;
  sidebarOpen?: boolean;
}) {
  const { address } = useAccount();

  // Get native token balance
  const { data: balanceData } = useBalance({
    address: address,
  });


  return (
    <header
      className="bg-white shadow-lg transition-all duration-300"
      style={{ marginLeft: isMobile ? 0 : sidebarOpen ? 250 : 80 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isMobile && onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <LogsIcon className="h-6 w-6 text-gray-600" />
            </button>
          )}
          {!isMobile && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Collection"
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all w-64"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">

            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                <span className="font-medium">$0.00</span> CTEA
              </span>
              <span className="text-white/30">|</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                <span className="font-medium"> ${balanceData?.formatted.slice(0, 5) || "0.00"}
                </span> TEA
              </span>
              <span className="text-white/30">|</span>
            </div>
          </div>

          <HomeConnect />
        </div>
      </div>
    </header>
  );
}
