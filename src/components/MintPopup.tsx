'use client';
import { useCarousel } from '@/hooks/useCarousel';
import { SparklesIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

const carouselImages = [
    {
        name: 'Steamland',
        image: '/images/banner1.png',
        status: 'live',
        button: 'Mint Collection',
        openseaSlug: 'steamland',
        price: '0.1 TEA',
    },
    {
        name: 'Tea in The House',
        image: '/images/banner2.png',
        status: 'finish',
        button: 'Market',
        openseaSlug: 'tea-in-the-house',
        price: '0.2 TEA',
    },
    {
        name: 'Pink is Love',
        image: '/images/banner3.png',
        status: 'live',
        button: 'Mint Collection',
        openseaSlug: 'pink-is-love',
        price: '0.15 TEA',
    }
];

const MintPopup = ({ slide, onClose }: { slide: typeof carouselImages[0]; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <div
                style={{ backgroundImage: "url('/backgroundhome.png')" }}
                className="backdrop-blur-lg bg-cover bg-center bg-no-repeat rounded-2xl border border-white/20 shadow-2xl max-w-md w-full animate-fade-in relative mx-2 sm:mx-4"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/90 hover:text-white transition-colors text-xl sm:text-2xl"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="pt-6 sm:pt-8 px-4 sm:px-6 text-center">
                    <h1 className="text-white/90 text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 [font-family:'McLaren-Regular']">
                        {slide.name} Checkout
                    </h1>
                    <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6">
                        Price per item: <span className="font-semibold text-white/90">{slide.price}</span>
                    </p>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
                    {/* Balance */}
                    <div className="bg-white/10 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm sm:text-base">Your Balance:</span>
                            <span className="text-white/90 font-bold text-sm sm:text-base">12.45 TEA</span>
                        </div>
                    </div>

                    {/* Price & Quantity */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm sm:text-base">Price per item</span>
                            <span className="text-white/90 font-bold text-sm sm:text-base">{slide.price}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <span className="text-white/70 text-sm sm:text-base">Quantity</span>
                            <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm">
                                <button className="text-white/90 hover:text-white text-base sm:text-lg">-</button>
                                <span className="text-white/90 font-bold mx-1 sm:mx-2 text-sm sm:text-base">1</span>
                                <button className="text-white/90 hover:text-white text-base sm:text-lg">+</button>
                            </div>
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="bg-white/10 p-3 sm:p-4 rounded-xl space-y-1 sm:space-y-2 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm sm:text-base">Platform & Gas Fee</span>
                            <span className="text-white/90 text-sm sm:text-base">0.002 TEA</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 sm:pt-4 border-t border-white/20 gap-2">
                        <span className="text-white/70 text-base sm:text-lg">You will pay</span>
                        <div className="text-right">
                            <div className="text-white/90 font-bold text-lg sm:text-xl">0.107 TEA</div>
                            <div className="text-white/70 text-xs sm:text-sm">≈ $1.23</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-blue-400/90 transition-all duration-300"
                            style={{ width: `42%` }}
                        />
                    </div>

                    {/* Mint Button */}
                    <button
                        className="w-full bg-gradient-to-r from-blue-400/90 to-purple-400/90 hover:from-blue-500/90 hover:to-purple-500/90 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                        <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-lg">Mint</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="pt-4 sm:pt-6 px-4 sm:px-6 text-center pb-4">
                    <p className="text-white/70 text-xs sm:text-sm">Powered by tea.xyz</p>
                </div>
            </div>
        </div>
    );
};