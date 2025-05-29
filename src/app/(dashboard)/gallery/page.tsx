// app/(routes)/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import data from "@/config/data.json";
import rarityData from "@/config/rarity.json";


import { GripHorizontalIcon, Plus, X, Search } from 'lucide-react';

import Image from "next/image";

interface NFTItem {
  id: string;
  name: string;
  image: string;
  edition: number;
  traits: Record<string, string>;
  price?: number;
  rarity?: number;
}

const GalleryPage = () => {
  const [items, setItems] = useState<NFTItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<NFTItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NFTItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    // Simulasi data NFT dengan rarity dan price
    const processedData = data.map((item) => ({
      id: item.dna,
      name: item.name,
      image: item.image,
      edition: item.edition,
      traits: item.attributes.reduce((acc, attr) => {
        acc[attr.trait_type] = attr.value;
        return acc;
      }, {} as Record<string, string>),
      rarity: Math.floor(Math.random() * 100) + 1, // Rarity dari 1-100
      price: parseFloat((Math.random() * 10 + 0.5).toFixed(2)), // Harga antara 0.50 - 10.50
    }));
    setItems(processedData);
    setFilteredItems(processedData);
  }, []);

  useEffect(() => {
    let results = [...items];

    if (searchQuery) {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) // Bisa juga cari by ID/DNA
      );
    }

    if (selectedTraits.length > 0) {
      results = results.filter((item) => {
        const itemTraitValues = Object.values(item.traits);
        return selectedTraits.every((trait) =>
          itemTraitValues.includes(trait)
        );
      });
    }

    setFilteredItems(results);
  }, [searchQuery, selectedTraits, items]);

  const handleTraitSelect = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const handleClearFilters = () => {
    setSelectedTraits([]);
    setSearchQuery("");
  };

  const openModal = (item: NFTItem) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    // Latar belakang putih/abu-abu terang dengan gradient halus
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="mb-10 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 drop-shadow-lg tracking-tight">
          Ethereal Gallery
          <span className="block mt-2 text-lg md:text-xl font-medium text-gray-600">
            Discover a Universe of Unique Digital Collectibles
          </span>
        </h1>
      </header>

      {/* Search and Filters */}
      <div className="mb-8 space-y-5 animate-scale-in">
        <div className="relative group w-full max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-24 py-4 rounded-full bg-white border border-gray-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-200/50 text-gray-900 placeholder-gray-500 transition-all shadow-lg text-lg outline-none"
            placeholder="Search NFTs by name or ID..."
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-200 text-gray-600 text-sm rounded-lg shadow-md font-mono">
            ⌘K
          </kbd>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GripHorizontalIcon className="w-6 h-6 text-purple-600" />
            <span className="font-semibold">Active Filters:</span>
          </div>

          {selectedTraits.map((trait) => (
            <button
              key={trait}
              onClick={() => handleTraitSelect(trait)}
              className="flex items-center gap-2 bg-gray-100 border border-gray-300 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-300 transition-all transform hover:scale-105 shadow-sm"
            >
              <span className="text-red-500">🗑️</span> {trait}
              <X className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          ))}

          {selectedTraits.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-1 hover:scale-105 transition-transform font-semibold"
            >
              <X className="w-5 h-5 mr-1" />
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Sidebar & NFT Grid */}
      <div className="flex flex-col lg:flex-row gap-6 pb-8">
        {/* Filter Sidebar */}
        <aside className="lg:w-72 w-full h-auto lg:h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar-thin bg-white rounded-2xl shadow-xl border border-gray-200 p-4 animate-slide-in-left">
          <div className="space-y-4">
            {Object.entries(rarityData).map(([category, traits]) => (
              <div
                key={category}
                className="border-b border-gray-200 last:border-0 pb-3"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-base font-semibold text-gray-800">
                    🌿 {category}
                  </span>
                  <Plus
                    className={`w-5 h-5 text-teal-600 transform ${openCategories[category] ? "rotate-45" : ""
                      } transition-transform group-hover:text-purple-600`}
                  />
                </button>

                {openCategories[category] && (
                  <div className="pl-3 space-y-2 mt-2 animate-fade-in">
                    {traits.map((trait) => (
                      <label
                        key={trait.trait}
                        className="flex items-center gap-3 p-2 text-sm hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTraits.includes(trait.trait)}
                          onChange={() => handleTraitSelect(trait.trait)}
                          className="h-4 w-4 rounded-sm border-2 border-gray-400 bg-white checked:bg-purple-600 checked:border-purple-600 focus:ring-purple-600 transition-colors accent-purple-600"
                        />
                        <span className="flex-1 truncate text-gray-700">
                          🌟 {trait.trait}
                        </span>
                        <span className="text-xs text-teal-700 px-2 py-0.5 bg-teal-100 rounded-full font-mono">
                          {trait.weight}%
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* NFT Grid */}
        <div className="flex-1 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start animate-fade-in-up">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <article
                key={item.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl hover:border-teal-500 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] card-tilt"
                onClick={() => openModal(item)}
              >
                {/* Image Section */}
                <div className="relative aspect-square w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    priority={false}
                  />
                  {/* Overlay for aesthetic */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  {/* Rarity Tag */}
                  <span className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
                    Rarity: {item.rarity}
                  </span>
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col items-start">
                  <h3 className="text-lg font-bold text-gray-900 truncate w-full mb-1">
                    {item.name}
                  </h3>
                  <div className="flex justify-between items-center w-full text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-bold text-teal-600 flex items-center gap-1">
                      {item.price?.toFixed(2) || "--"} <span className="text-xs">Ξ</span>
                    </span>
                  </div>
                  {/* Hover Overlay Buttons */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                    <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-teal-600 hover:to-blue-600 transition-all transform hover:scale-105">
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500 text-xl font-medium animate-fade-in">
              No NFTs found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {isOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-[95vw] md:max-w-3xl mx-2 overflow-hidden shadow-2xl border border-gray-200 animate-slide-in-modal">
            {/* Modal Header */}
            <div className="p-3 md:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 flex items-center gap-2">
                ✨ NFT Details
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8 max-h-[80vh] overflow-y-auto custom-scrollbar-thin">
              {/* Image Section */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-xl">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-200/60 to-transparent" />
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-xl md:text-4xl font-extrabold text-gray-900 mb-1 leading-tight">
                    {selectedItem.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    A rare piece from the Ethereal Collection.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-100 rounded-xl shadow-inner">
                    <p className="text-xs text-gray-500 mb-1">
                      ✨ Rarity Score
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl md:text-3xl font-bold text-teal-600">
                        {selectedItem.rarity}
                      </span>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse-short"
                          style={{ width: `${selectedItem.rarity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-xl shadow-inner">
                    <p className="text-xs text-gray-500 mb-1">
                      💰 Last Price
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl md:text-3xl font-bold text-teal-600">
                        {selectedItem.price?.toFixed(2)}
                      </span>
                      <span className="text-lg md:text-xl text-teal-600">
                        Ξ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traits */}
                <div className="space-y-2">
                  <h4 className="text-base md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    🎨 Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedItem.traits).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1 border border-gray-200 shadow-sm"
                      >
                        <span className="text-sm">🧬</span>
                        <span className="truncate">
                          {key}: {value}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col xs:flex-row gap-3 pt-4">
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 text-base rounded-lg shadow-xl hover:shadow-lg transition-all transform hover:scale-[1.02]">
                    🛍️ Buy Now
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-3 text-base rounded-lg hover:bg-gray-100 transition-colors shadow-md">
                    💌 Make Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for custom scrollbar and animations */}
      <style jsx global>{`
        /* --- Scrollbar Styling (Hidden & Thin) --- */
        /* Hide scrollbar for elements with 'hide-scrollbar' class */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none;    /* Firefox */
        }

        /* Custom thin scrollbar for elements with 'custom-scrollbar-thin' class */
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 8px; /* For vertical scrollbars */
          height: 8px; /* For horizontal scrollbars */
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: theme('colors.gray.100'); /* Track color in light mode */
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: theme('colors.teal.500'); /* Thumb color */
          border-radius: 10px;
          border: 2px solid theme('colors.gray.100'); /* Padding around thumb */
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: theme('colors.teal.600'); /* Darker thumb on hover */
        }
        /* Firefox scrollbar styling */
        .custom-scrollbar-thin {
          scrollbar-color: theme('colors.teal.500') theme('colors.gray.100'); /* thumb track */
          scrollbar-width: thin;
        }

        /* --- Custom Animations (Same as before, adapted for light mode) --- */

        /* Fade In */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        /* Fade In Up */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        /* Scale In */
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scaleIn 0.7s ease-out forwards;
          animation-delay: 0.2s; /* Delay for sequence */
        }

        /* Slide In Left */
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
          animation-delay: 0.4s; /* Delay for sequence */
        }

        /* Modal Slide In */
        @keyframes slideInModal {
            from { opacity: 0; transform: translateY(-50px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-in-modal {
            animation: slideInModal 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        /* Pulse Short (for rarity bar) */
        @keyframes pulseShort {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-pulse-short {
          animation: pulseShort 1.5s infinite ease-in-out;
        }

        /* Drop Shadow for Header */
        .drop-shadow-lg {
          text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Card Tilt Effect on Hover */
        .card-tilt {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .card-tilt:hover {
          transform: translateY(-5px); /* subtle lift */
        }
        .card-tilt:hover .group-hover\\:scale-110 {
          transform: scale(1.1); /* Image zoom */
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;