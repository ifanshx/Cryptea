"use client"
interface CarouselSlide {
    name: string;
    image: string;
    assetFolder: string;
    button: string;
    openseaSlug: string;
    price: string;
}

interface MintPopupProps {
    slide: CarouselSlide;
    onClose: () => void;
}

export default function MintPopup({ slide, onClose }: MintPopupProps) {


    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
            <div className="rounded-lg gap-2 items-center justify-center p-2 w-full max-w-7xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto overflow-hidden">


                <div className="relative w-full max-w-lg sm:max-w-md md:max-w-sm bg-white/40 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-between gap-4 p-4 sm:p-6 text-white">
                    {/* Close */}
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-3 right-3 w-6 h-6 text-white/80 hover:text-white flex items-center justify-center rounded-full transition-colors"
                    >
                        ✕
                    </button>

                    {/* Header */}
                    <div className="text-center space-y-1 pt-6">
                        <h1 className="text-lg sm:text-xl font-bold">
                            Checkout {slide.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-white/70">
                            Expand your digital collection with a tea!
                        </p>
                    </div>

                    {/* Balance */}
                    <div className="bg-white text-gray-900 rounded-xl px-4 py-3 shadow-inner">
                        <div className="flex flex-col items-center">
                            <span className="text-xs sm:text-sm text-gray-500">
                                Your balance
                            </span>
                            <span className="mt-1 text-xl sm:text-2xl font-bold">
                                1 $TEA
                            </span>
                        </div>
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs sm:text-sm text-white/70">
                                Price per item
                            </span>
                            <div className="bg-gray-600 text-center text-white rounded-xl px-2 py-1 shadow-inner mt-1">
                                <span className="block text-lg sm:text-xl font-bold">
                                    {slide.price}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs sm:text-sm text-white/70">Quantity</span>
                            <div className="bg-gray-600 text-center text-white rounded-xl px-2 py-1 shadow-inner mt-1">
                                <span className="block text-lg sm:text-xl font-bold">1</span>
                            </div>
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="text-xs sm:text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/70">Platform & gas fees</span>
                            <span>0.5 $TEA</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-white/70">You will pay</span>
                            <span className="font-bold">2.5 $TEA</span>
                        </div>
                    </div>

                    {/* Mint Button */}
                    <button

                        className="w-full bg-white text-gray-900 rounded-lg py-2 font-bold hover:bg-gray-100 transition"
                    >
                        Mint
                    </button>

                    {/* Progress Bar */}
                    <div className="relative mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <div
                            className="absolute h-full bg-white transition-all duration-300"
                            style={{
                                width: `${(12 / 2222) * 100
                                    }%`,
                            }}
                        />
                    </div>
                    <div className="text-xs sm:text-sm text-white/70 text-right">
                        12/2222
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-gray-700 text-center">
                        <p className="text-xs sm:text-sm text-white/70">
                            Powered by tea.xyz
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}