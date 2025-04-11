"use client"
import Image from 'next/image';
import React, { useEffect } from 'react'

const collections = [
    {
        title: "Steamland",
        description: "We are more than just a brand – It’s… more.",
        image: "/assets/EtherealEntities.png",
        minted: 998,
        total: 1000,
    },
    {
        title: "Bear With Me",
        description: "Let's ride out this ‘Bear’ thing… more.",
        image: "/assets/EtherealEntities.png",
        minted: 8340,
        total: 10000,
    },
    {
        title: "Pink is Punk",
        description: "A bold assembly of 1,555 rebellious… more.",
        image: "/assets/EtherealEntities.png",
        minted: 555,
        total: 1555,
    },
];

const FeaturedCollection = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            document.querySelectorAll('.collection-card').forEach((el) => {
                el.classList.remove('opacity-0', 'translate-y-10');
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full bg-white/20 backdrop-blur-md mb-10 md:mb-16 rounded-3xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-6 md:mb-8 opacity-0 translate-y-10 transition-all duration-500 collection-card">
                Featured Collection
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                {collections.map((item, index) => {
                    const progress = (item.minted / item.total) * 100;

                    return (
                        <div
                            key={index}
                            className="collection-card bg-white/20 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 text-black flex flex-col items-center min-h-[400px] md:min-h-[450px] opacity-0 translate-y-10 hover:-translate-y-2 "
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            {/* Image Container */}
                            <div className="relative w-full aspect-square overflow-hidden rounded-xl md:rounded-2xl group">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            {/* Content Container */}
                            <div className="w-full mt-4 space-y-4">
                                {/* Title and Button Section */}
                                <div className="flex items-start justify-between gap-4">
                                    {/* Text Content */}
                                    <div className="flex-1">
                                        <h3 className="text-lg md:text-xl font-semibold line-clamp-1 transition-colors hover:text-primary">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-700 line-clamp-2 mt-1">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Mint Button */}
                                    <div className='flex items-center justify-center '>
                                        <button className="cursor-pointer bg-white text-black text-sm md:text-base font-bold py-3 px-6 md:py-3 md:px-7 rounded-full shadow hover:bg-gray-100 transition-all duration-200 active:scale-95 hover:shadow-md whitespace-nowrap">
                                            Mint
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar Section */}
                                <div className="w-full">
                                    <div className="h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-[10px] md:text-xs mt-1">
                                        {item.minted}/{item.total}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default FeaturedCollection