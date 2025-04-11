"use client"

import React, { useEffect } from 'react'
import CollectorCard from './CollectorCard';

const collectors = [
    { rank: "1", avatar: "/assets/EtherealEntities.png", address: "Collection 1", amount: "4,856.50" },
    { rank: "2", avatar: "/assets/EtherealEntities.png", address: "Collection 2", amount: "2,756.113450" },
    { rank: "3", avatar: "/assets/EtherealEntities.png", address: "Collection 3", amount: "1,000" },
    { rank: "4", avatar: "/assets/EtherealEntities.png", address: "Collection 4", amount: "957.2340" },
    { rank: "5", avatar: "/assets/EtherealEntities.png", address: "Collection 5", amount: "588.12" },
    { rank: "6", avatar: "/assets/EtherealEntities.png", address: "Collection 6", amount: "420.02" },
];

const TopCollector = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            document.querySelectorAll('.collector-item').forEach((el) => {
                el.classList.remove('opacity-0', 'translate-y-8');
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl py-8 px-4 sm:px-6 lg:px-8 mb-12 md:mb-20 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center opacity-0 translate-y-8 transition-all duration-500 collector-item">
                Top Collectors
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {collectors.map((c, i) => (
                    <CollectorCard
                        key={i}
                        {...c}
                        className="cursor-pointer collector-item opacity-0 translate-y-8 transition-all duration-500"
                        style={{ transitionDelay: `${i * 75}ms` }}
                    />
                ))}
            </div>
        </div>
    )
}

export default TopCollector