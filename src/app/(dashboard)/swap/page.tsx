"use client";


import React, { useState } from 'react';
import { ArrowDownUp, ChevronDown } from 'lucide-react';

const CHAINS = ['ETH', 'TEA'];

export default function SwapPage() {
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [fromChain, setFromChain] = useState(CHAINS[0]);
    const [toChain, setToChain] = useState(CHAINS[1]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm relative space-y-10 p-2 ">
                <h2 className="text-center text-xl font-medium pt-6">Swap</h2>
                <div className="px-5 space-y-5">
                    {/* From */}
                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">From</label>
                            <div className="flex items-baseline space-x-2">
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={fromAmount}
                                    onChange={e => setFromAmount(e.target.value)}
                                    className="w-20 bg-transparent text-2xl font-bold text-gray-900 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500">$0</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <label className="text-xs text-gray-500 mb-1">Chain</label>
                            <select
                                value={fromChain}
                                onChange={e => setFromChain(e.target.value)}
                                className="bg-teal-400 text-white text-sm font-medium py-1 px-3 rounded-full focus:ring-2 focus:ring-teal-200"
                            >
                                {CHAINS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Swap Icon */}
                    <div className="flex justify-center -mt-6">
                        <div className="bg-teal-400 p-2 rounded-full shadow-md hover:bg-teal-500 transition">
                            <ArrowDownUp className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* To */}
                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500 mb-1">To</label>
                            <div className="flex items-baseline space-x-2">
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={toAmount}
                                    onChange={e => setToAmount(e.target.value)}
                                    className="w-20 bg-transparent text-2xl font-bold text-gray-900 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500">$0</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <label className="text-xs text-gray-500 mb-1">Chain</label>
                            <select
                                value={toChain}
                                onChange={e => setToChain(e.target.value)}
                                className="bg-teal-400 text-white text-sm font-medium py-1 px-3 rounded-full focus:ring-2 focus:ring-teal-200"
                            >
                                {CHAINS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Confirm */}
                    <button className="w-full bg-teal-400 hover:bg-teal-500 text-white py-3 rounded-full font-medium transition">
                        Confirm
                    </button>
                </div>

                {/* Bottom Chevron */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                </div>
            </div>
        </div>
    );
}
