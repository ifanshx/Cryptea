// components/LeaderboardSticky.tsx
import Image from 'next/image';
import React from 'react';
import { Loader } from 'lucide-react'; // Import Loader icon

/**
 * Truncate long Ethereum addresses to format 0xAB...CDEF
 */
function truncateAddress(address: string): string {
    return address && address.length > 8
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : address;
}

/**
 * Leaderboard showing top 10 and ensuring 'You' entry always visible.
 * Highlights the 'You' entry with a green border.
 * @param {{ address: string; avatar: string; amount: number }[]} leaderboard
 * @param {string} currentAddress
 * @param {boolean} isLoading - Indicates if the leaderboard data is currently loading.
 * @param {string | null} error - Error message if fetching failed.
 */
interface LeaderboardEntry {
    address: string;
    avatar: string;
    amount: number;
}

interface LeaderboardStickyProps {
    leaderboard: LeaderboardEntry[];
    currentAddress: string;
    isLoading: boolean; // <-- Ditambahkan
    error: string | null; // <-- Ditambahkan
}

export default function LeaderboardSticky({ leaderboard, currentAddress, isLoading, error }: LeaderboardStickyProps) {
    // Sorted descending by amount
    const sorted = React.useMemo(
        () => [...leaderboard].sort((a, b) => b.amount - a.amount),
        [leaderboard]
    );

    // Map each address to its rank
    const rankMap = React.useMemo(() => {
        const map: Record<string, number> = {};
        sorted.forEach((entry, idx) => {
            map[entry.address] = idx + 1;
        });
        return map;
    }, [sorted]);

    // Find index of current user
    const youEntry = React.useMemo(
        () => sorted.find((e) => e.address.toLowerCase() === currentAddress.toLowerCase()) || null,
        [sorted, currentAddress]
    );

    // Entries excluding current user, for the main list
    const otherEntries = React.useMemo(
        () => sorted.filter((e) => e.address.toLowerCase() !== currentAddress.toLowerCase()),
        [sorted, currentAddress]
    );

    // Only display top 10 from others
    const displayEntries = React.useMemo(
        () => otherEntries.slice(0, 10),
        [otherEntries]
    );

    return (
        <aside className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
            <div className="bg-white rounded-2xl shadow overflow-y-auto max-h-[500px] relative">
                {isLoading ? (
                    <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                        <Loader className="w-6 h-6 animate-spin text-gray-400 mb-2" />
                        Loading leaderboard...
                    </div>
                ) : error ? (
                    <div className="py-12 text-center text-red-500">
                        Error: {error}
                        <br />
                        Could not load leaderboard.
                    </div>
                ) : (
                    <>
                        <ul className="divide-y divide-gray-100">
                            {displayEntries.map((entry) => (
                                <li
                                    key={entry.address}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-6 text-sm font-semibold text-gray-700">
                                            {rankMap[entry.address]}.
                                        </span>
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                            <Image src={entry.avatar} alt={entry.address} layout="fill" objectFit="cover" />
                                        </div>
                                        <span className="truncate max-w-[6rem] text-sm text-gray-800">
                                            {truncateAddress(entry.address)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {entry.amount.toLocaleString()} CTEA
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Sticky entry for current user if exists */}
                        {youEntry && (
                            // Pastikan tidak ada duplikasi jika `youEntry` juga di 10 besar `displayEntries`
                            !displayEntries.some(e => e.address.toLowerCase() === youEntry.address.toLowerCase()) && (
                                <div className="sticky bottom-0 bg-white border-2 border-green-500 rounded-b-2xl px-4 py-3 flex items-center justify-between z-10">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-6 text-sm font-semibold text-gray-700">
                                            {rankMap[currentAddress]}.
                                        </span>
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                            <Image
                                                src={youEntry.avatar}
                                                alt={currentAddress}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                        </div>
                                        <span className="truncate max-w-[6rem] text-sm font-medium text-gray-900">
                                            {truncateAddress(currentAddress)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {youEntry.amount.toLocaleString()} CTEA
                                    </span>
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </aside>
    );
}