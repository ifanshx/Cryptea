
'use client'
import { useEffect, useState } from 'react'

export default function Header() {
    const [time, setTime] = useState('00:00')

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
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold text-gray-900">Search Collection</h1>
                <div className="flex items-center gap-4 text-gray-600">
                    <span>{time} CTEA</span>
                    <span>{time} TEA</span>
                </div>
            </div>

            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors font-medium">
                Connect Wallet
            </button>
        </header>
    )
}