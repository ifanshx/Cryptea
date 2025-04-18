// components/Header.tsx
'use client'
import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon, WalletIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function Header() {
    const [time, setTime] = useState('00:00')
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }))
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <header className="bg-gradient-to-r from-blue-700 to-purple-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-8">
                    {/* Search Section */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-white/80" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Collection"
                            className="pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-full 
                text-white placeholder-white/70 focus:outline-none focus:ring-2 
                focus:ring-white/30 transition-all w-64"
                        />
                    </div>


                </div>

                {/* Right Section - Wallet Button */}


                {/* Time & Currency */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-white/90">
                        <ClockIcon className="h-5 w-5" />
                        <span className="font-medium">{time}</span>
                    </div>
                    <div className="flex space-x-2">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-white/90">CTEA</span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-sm text-white/90">TEA</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsConnected(!isConnected)}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all
            ${isConnected
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-white hover:bg-gray-100 text-blue-600'
                        }`}
                >
                    <WalletIcon className={`h-5 w-5 ${isConnected ? 'text-white' : 'text-blue-600'}`} />
                    <span className="font-semibold">
                        {isConnected ? 'Connected' : 'Connect Wallet'}
                    </span>
                </button>
            </div>
        </header>
    )
}