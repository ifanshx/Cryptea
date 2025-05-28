'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, User, Search, Ticket } from 'lucide-react';
import Link from 'next/link';

// Interface untuk data peserta
interface Participant {
    id: string;
    walletAddress: string;
    ticketsBought: number;
    purchaseDate: string;
}

// Interface untuk data NFT Raffle (minimal, disesuaikan untuk halaman ini)
interface RaffleNFT {
    id: number;
    name: string;
}

// Data dummy untuk NFT Raffle (hanya ID dan nama yang relevan di sini)
const raffleNFTs: RaffleNFT[] = [
    { id: 1, name: 'PockeT Monsters 2.0 #611' },
    { id: 2, name: 'PockeT Monsters 2.0 #131' },
    { id: 3, name: 'PockeT Monsters 2.0 #123' },
];

// Data dummy peserta (sesuai dengan nftId)
const dummyParticipants: { [key: number]: Participant[] } = {
    1: [
        { id: 'p1', walletAddress: '0xabc...123', ticketsBought: 5, purchaseDate: '2025-05-20T10:00:00Z' },
        { id: 'p2', walletAddress: '0xdef...456', ticketsBought: 2, purchaseDate: '2025-05-21T11:30:00Z' },
        { id: 'p3', walletAddress: '0xghi...789', ticketsBought: 1, purchaseDate: '2025-05-22T14:15:00Z' },
        { id: 'p4', walletAddress: '0xjkl...012', ticketsBought: 8, purchaseDate: '2025-05-23T09:00:00Z' },
        { id: 'p5', walletAddress: '0xmno...345', ticketsBought: 3, purchaseDate: '2025-05-24T16:45:00Z' },
    ],
    2: [
        { id: 'p6', walletAddress: '0xzzz...987', ticketsBought: 10, purchaseDate: '2025-05-18T08:00:00Z' },
        { id: 'p7', walletAddress: '0xyyy...654', ticketsBought: 1, purchaseDate: '2025-05-19T13:00:00Z' },
    ],
    3: [
        { id: 'p8', walletAddress: '0xaaa...bbb', ticketsBought: 12000, purchaseDate: '2021-05-30T10:00:00Z' },
    ],
};

// Fungsi helper untuk memformat tanggal
function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function RaffleParticipantsPage() {
    const params = useParams();
    const nftId = typeof params.nftId === 'string' ? parseInt(params.nftId, 10) : undefined;

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [raffleName, setRaffleName] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        if (nftId) {
            const selectedRaffle = raffleNFTs.find(nft => nft.id === nftId);
            if (selectedRaffle) {
                setRaffleName(selectedRaffle.name);
            }
            setParticipants(dummyParticipants[nftId] || []);
        }
    }, [nftId]);

    const filteredParticipants = participants.filter(p =>
        p.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/raffle" className="flex items-center text-gray-600 hover:text-gray-900 transition">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        <span className="font-medium">Back to Raffles</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 text-center flex-grow">
                        Participants for &quot;{raffleName}&quot;
                    </h1>
                    <div className="w-24"></div> {/* Placeholder for alignment */}
                </div>

                {/* Dashboard Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50 p-5 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700">Total Participants</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{participants.length}</p>
                        </div>
                        <User className="w-10 h-10 text-blue-400" />
                    </div>
                    <div className="bg-green-50 p-5 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700">Total Tickets Sold</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {participants.reduce((sum, p) => sum + p.ticketsBought, 0).toLocaleString()}
                            </p>
                        </div>
                        <Ticket className="w-10 h-10 text-green-400" />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search by wallet address..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                {/* Participants Table */}
                <div className="overflow-x-auto">
                    {filteredParticipants.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Wallet Address
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tickets Bought
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Purchase Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredParticipants.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {p.walletAddress}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {p.ticketsBought}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(p.purchaseDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? "No participants found for this search." : "No participants yet for this raffle."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}