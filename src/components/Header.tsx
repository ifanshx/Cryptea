// components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ClockIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

export default function Header({
  onMenuToggle,
  isMobile,
  sidebarOpen = false,
}: {
  onMenuToggle?: () => void;
  isMobile?: boolean;
  sidebarOpen?: boolean;
}) {
  const [time, setTime] = useState("00:00");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
          )}
          {!isMobile && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
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
              <ClockIcon className="h-5 w-5" />
              <span className="font-medium">{time}</span>
            </div>
            <div className="flex space-x-2">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                CTEA
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                TEA
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsConnected((c) => !c)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
              isConnected
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <WalletIcon className="h-5 w-5" />
            <span className="font-semibold">
              {isConnected ? "Connected" : "Connect Wallet"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
