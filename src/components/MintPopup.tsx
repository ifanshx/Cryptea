'use client';
import React, { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

enum Status {
    LIVE = 'Live',
    FINISH = 'Finish',
    LIVE_GENERATE = 'Live Generate',
    COMING_SOON = 'Coming Soon'
}

interface CarouselSlide {
    name: string;
    image: string;
    status: Status;
    button: string;
    openseaSlug: string;
    price: string;
}

interface MintPopupProps {
    slide: CarouselSlide;
    onClose: () => void;
}

const TX_EXPLORER_URL = 'https://sepolia.tea.xyz/tx';
const POWERED_BY_TEXT = 'Powered by tea.xyz';
const TEA_USD_PRICE = 11.5;

const MintPopup = ({ slide, onClose }: MintPopupProps) => {
    const [minted, setMinted] = useState(false);
    const [txUrl, setTxUrl] = useState('');
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Price calculations
    const pricePerItem = parseFloat(slide.price.replace(/[^0-9.]/g, ''));
    const platformFee = 0.002;
    const subTotal = pricePerItem * quantity;
    const totalPrice = subTotal + platformFee;
    const usdEquivalent = (totalPrice * TEA_USD_PRICE).toFixed(2);

    const handleQuantityChange = (operation: 'increment' | 'decrement') => {
        setQuantity(prev => {
            if (operation === 'decrement' && prev > 1) return prev - 1;
            if (operation === 'increment') return prev + 1;
            return prev;
        });
    };

    const handleMint = useCallback(async () => {
        if (slide.status === Status.COMING_SOON) return;
        try {
            setError('');
            const fakeTxHash = `0x${Math.random().toString(16).slice(2)}?quantity=${quantity}`;
            setTxUrl(`${TX_EXPLORER_URL}/${fakeTxHash}`);
            setMinted(true);
        } catch (err) {
            setError('Mint failed. Please try again.');
            console.error('Mint error:', err);
        }
    }, [quantity, slide.status]);

    const handleShare = useCallback(() => {
        const tweetText = encodeURIComponent(
            `🎉 Baru saja mint ${quantity} NFT "${slide.name}"!\n` +
            `🔗 TX: ${txUrl}\n` +
            `🌐 Tersedia di OpenSea: https://opensea.io/collection/${slide.openseaSlug}/\n\n` +
            `#NFT #Web3 #TEAxyz`
        );

        window.open(
            `https://twitter.com/intent/tweet?text=${tweetText}`,
            '_blank',
            'width=550,height=420'
        );
    }, [txUrl, slide.name, slide.openseaSlug, quantity]);

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div className="relative bg-white rounded-xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-hidden">

                {/* Panel 1 - Trait Selection */}
                <div className="w-full md:w-1/3 p-3 sm:p-6 border-b md:border-r overflow-y-auto">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🧩 Customize Traits</h2>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                        {['Background', 'Specialty', 'Skin', 'Clothes', 'Beard', 'Head', 'Eyes', 'Mustache', 'Nose', 'Coin', 'Hands'].map((trait) => (
                            <button
                                key={trait}
                                className="bg-gray-100 hover:bg-gray-200 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition"
                            >
                                {trait}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                        {Array.from({ length: 20 }, (_, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-gray-200 rounded-lg sm:rounded-xl border border-gray-300 hover:scale-105 transition-transform"
                            />
                        ))}
                    </div>
                </div>

                {/* Panel 2 - NFT Preview */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 border-b md:border-r bg-gray-50">
                    <div className="w-full aspect-square bg-yellow-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-inner mb-3 sm:mb-4">
                        <img
                            src="/sample-nft.png"
                            alt="NFT Preview"
                            className="object-cover w-full h-full"
                            loading="lazy"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 hover:text-black transition font-medium">
                        🎲 Randomize
                    </button>
                </div>

                {/* Panel 3 - Mint Info */}
                <div className="w-full md:w-1/3 p-4 sm:p-6 flex flex-col justify-between bg-black/30 backdrop-blur-lg relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
                        aria-label="Close mint popup"
                    >
                        ✕
                    </button>

                    {slide.status === Status.COMING_SOON ? (
                        <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-3 sm:space-y-4">
                            <div className="w-full aspect-square rounded-xl overflow-hidden filter blur-sm">
                                <img
                                    src={slide.image}
                                    alt="Coming Soon"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <span className="text-xl sm:text-2xl font-extrabold text-white bg-black bg-opacity-50 px-3 sm:px-4 py-1 sm:py-2 rounded-lg">
                                {Status.COMING_SOON}
                            </span>
                            <button
                                disabled
                                className="w-full bg-white/20 text-white opacity-50 cursor-not-allowed font-bold py-2 rounded-lg sm:rounded-xl"
                            >
                                {Status.COMING_SOON}
                            </button>
                        </div>
                    ) : minted ? (
                        <div className="flex flex-col items-center text-center p-3 sm:p-4 space-y-2 sm:space-y-3">
                            <h1 className="text-white text-lg sm:text-xl font-bold">Congrats</h1>
                            <p className="text-white/80 text-xs sm:text-sm">Minted {quantity} NFT{quantity > 1 && 's'}</p>

                            <div className="w-full aspect-square rounded-xl overflow-hidden">
                                <img
                                    src={slide.image}
                                    alt="Minted NFT"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>

                            <button
                                onClick={() => setMinted(false)}
                                className="w-full bg-gradient-to-r from-blue-400/90 to-purple-400/90 hover:from-blue-500/90 hover:to-purple-500/90 text-white font-bold py-2 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm text-sm"
                            >
                                Mint Again
                            </button>

                            <div className="text-white/70 text-xs flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-1">
                                {txUrl && (
                                    <a
                                        href={txUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        View TX
                                    </a>
                                )}
                                <span>|</span>
                                <button onClick={handleShare} className="hover:underline">
                                    Share NFT
                                </button>
                                <span>|</span>
                                <button
                                    onClick={() => window.open(
                                        `https://opensea.io/collection/${slide.openseaSlug}/`,
                                        '_blank'
                                    )}
                                    className="hover:underline"
                                >
                                    Trade
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="pt-4 sm:pt-6 px-3 sm:px-5 text-center space-y-2 sm:space-y-3">
                                <h1 className="text-white text-lg sm:text-xl font-bold">
                                    Checkout {slide.name}
                                </h1>
                                <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">
                                    Expand your digital collection with a tea!
                                </p>
                            </div>
                            <div className="px-2 sm:px-4 pb-2 sm:pb-4 space-y-3 sm:space-y-4">
                                {error && (
                                    <div className="text-red-400 text-xs p-2 bg-red-900/20 rounded-lg">
                                        ⚠️ {error}
                                    </div>
                                )}

                                {/* Balance */}
                                <div className="bg-white/10 p-2 sm:p-3 rounded-xl backdrop-blur-sm">
                                    <div className="flex justify-between items-center text-xs sm:text-sm">
                                        <span className="text-white/70">Your Balance:</span>
                                        <span className="text-white/90 font-bold">12.45 TEA</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="text-white/70">Price per item</span>
                                    <span className="text-white/90 font-bold">{slide.price}</span>
                                </div>

                                {/* Quantity */}
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="text-white/70">Quantity</span>
                                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 rounded-full px-2 sm:px-3 py-1 backdrop-blur-sm">
                                        <button
                                            onClick={() => handleQuantityChange('decrement')}
                                            className={`text-white/90 hover:text-white text-sm ${quantity === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={quantity === 1}
                                        >
                                            -
                                        </button>
                                        <span className="text-white/90 font-bold mx-1 text-sm">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange('increment')}
                                            className="text-white/90 hover:text-white text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Fees */}
                                <div className="bg-white/10 p-2 sm:p-3 rounded-lg space-y-1 backdrop-blur-sm text-xs sm:text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Platform & Gas Fee</span>
                                        <span className="text-white/90">0.002 TEA</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-white/20 text-xs sm:text-sm">
                                    <span className="text-white/70">You will pay</span>
                                    <div className="text-right">
                                        <div className="text-white/90 font-bold text-sm sm:text-base">
                                            {totalPrice.toFixed(3)} TEA
                                        </div>
                                        <div className="text-white/70 text-xs sm:text-sm">
                                            ≈ ${usdEquivalent}
                                        </div>
                                    </div>
                                </div>

                                {/* Mint Button */}
                                <button
                                    onClick={handleMint}
                                    className="w-full bg-gradient-to-r from-blue-400/90 to-purple-400/90 hover:from-blue-500/90 hover:to-purple-500/90 text-white font-bold py-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm text-sm"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Mint {quantity} NFT{quantity > 1 && 's'}</span>
                                </button>

                                {/* Progress Bar */}
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="h-full bg-blue-400/90 transition-all duration-300"
                                        style={{ width: '42%' }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer */}
                    <div className="pt-2 px-3 sm:px-5 text-center pb-2 sm:pb-3 border-t border-white/10">
                        <p className="text-white/70 text-xs">{POWERED_BY_TEXT}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MintPopup;