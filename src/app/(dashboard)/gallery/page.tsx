"use client";
import React, { useEffect, useState } from "react";
import data from "@/config/data.json";
import rarityData from "@/config/rarity.json";
import {
  AdjustmentsHorizontalIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
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
    const processedData = data.map((item) => ({
      id: item.dna,
      name: item.name,
      image: item.image,
      edition: item.edition,
      traits: item.attributes.reduce((acc, attr) => {
        acc[attr.trait_type] = attr.value;
        return acc;
      }, {} as Record<string, string>),
      rarity: Math.floor(Math.random() * 100),
      price: Math.random() * 10,
    }));
    setItems(processedData);
    setFilteredItems(processedData);
  }, []);

  useEffect(() => {
    let results = [...items];

    if (searchQuery) {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTraits.length > 0) {
      results = results.filter((item) =>
        selectedTraits.every((trait) =>
          Object.values(item.traits).includes(trait)
        )
      );
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Header Section - Improved mobile text sizing */}
      <header className="mb-8 mt-6 md:mt-12 text-center animate-fade-in">
        <div className="relative inline-block animate-float">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse-slow" />
          <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
            Ethereal Gallery
            <span className="block mt-1 md:mt-2 text-base md:text-xl text-purple-400 font-normal">
              by Digital Collectibles
            </span>
          </h1>
        </div>
      </header>

      {/* Search and Filters - Improved mobile layout */}
      <div className="mb-6 md:mb-8 space-y-4 animate-slide-down">
        <div className="relative group w-full mx-auto">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-20 md:pl-14 md:pr-24 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-purple-400/30 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 bg-white/80 backdrop-blur-sm placeholder-purple-400/60 transition-all shadow-lg font-medium text-purple-600 text-sm md:text-base"
            placeholder="🔍 Search NFTs..."
          />
          <kbd className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 px-2 md:px-3 py-1 md:py-1.5 bg-purple-400/20 text-purple-600 text-xs md:text-sm rounded-lg shadow-sm">
            ⌘K
          </kbd>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-pink-500" />
            <span className="font-medium">Active Filters:</span>
          </div>

          {selectedTraits.map((trait) => (
            <button
              key={trait}
              onClick={() => handleTraitSelect(trait)}
              className="flex items-center gap-2 bg-white/80 border-2 border-dashed border-purple-400/30 px-4 py-2 rounded-full text-sm hover:border-pink-400 transition-all group hover:scale-105 backdrop-blur-sm"
            >
              <span className="text-purple-600">✨ {trait}</span>
              <XMarkIcon className="w-4 h-4 text-purple-400/60 group-hover:text-pink-500 transition-colors" />
            </button>
          ))}

          {selectedTraits.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-purple-600 hover:text-pink-500 flex items-center gap-1 hover:scale-105 transition-transform"
            >
              <XMarkIcon className="w-5 h-5 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 pb-8">
        {/* Filter Sidebar - Mobile improvements */}
        <aside className="lg:w-72 w-full h-auto lg:h-[calc(100vh-200px)] overflow-y-auto bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border-2 border-purple-400/20 p-3 md:p-4">
          <div className="space-y-4">
            {Object.entries(rarityData).map(([category, traits]) => (
              <div
                key={category}
                className="border-b-2 border-purple-400/20 last:border-0"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex justify-between items-center p-3 hover:bg-purple-400/10 rounded-xl transition-colors hover:scale-[1.02]"
                >
                  <span className="text-sm font-medium text-purple-600">
                    🌿 {category}
                  </span>
                  <PlusIcon
                    className={`w-5 h-5 text-pink-500 transform ${
                      openCategories[category] ? "rotate-45" : ""
                    } transition-transform`}
                  />
                </button>

                {openCategories[category] && (
                  <div className="pl-2 space-y-2 mt-2 animate-fade-in">
                    {traits.map((trait) => (
                      <label
                        key={trait.trait}
                        className="flex items-center gap-3 p-2 text-sm hover:bg-purple-400/5 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTraits.includes(trait.trait)}
                          onChange={() => handleTraitSelect(trait.trait)}
                          className="h-4 w-4 rounded-full border-2 border-purple-400/30 checked:bg-purple-400 transition-colors"
                        />
                        <span className="flex-1 truncate text-purple-600">
                          🪴 {trait.trait}
                        </span>
                        <span className="text-xs text-pink-500 px-2 py-1 bg-purple-400/10 rounded-full">
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
        <div className="flex-1 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 content-start overflow-y-auto">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group bg-white/80 backdrop-blur-sm border-2 border-purple-400/20 rounded-xl md:rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all h-48 sm:h-64 flex flex-col"
              onClick={() => openModal(item)}
            >
              <div className="relative w-full flex-1 p-4 md:p-6 overflow-hidden rounded-t-xl md:rounded-t-2xl">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 33vw"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
              <div className="p-2 md:p-4 flex-none">
                <h3 className="text-xs md:text-sm font-bold truncate text-purple-600">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between mt-1 md:mt-2">
                  <span className="text-[10px] md:text-xs text-purple-400">
                    💎 Price:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs md:text-sm font-bold text-pink-500">
                      {item.price?.toFixed(2) || "--"}
                    </span>
                    <span className="text-xs md:text-sm text-pink-500">Ξ</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {/* NFT Detail Modal - Mobile improvements */}
      {isOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-xl md:rounded-2xl w-full max-w-[95vw] md:max-w-2xl mx-2 overflow-hidden shadow-xl md:shadow-2xl border-2 border-purple-400 transition-all">
            {/* Modal Header */}
            <div className="p-3 md:p-4 border-b-2 border-purple-400/20 flex justify-between items-center bg-purple-400/10">
              <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                ✨ NFT Details
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 md:p-2 hover:bg-purple-400/20 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 p-3 md:p-6 max-h-[80vh] overflow-y-auto">
              {/* Image Section */}
              <div className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-br from-purple-400/10 to-pink-50">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-50/50 to-transparent" />
              </div>

              {/* Details Section */}
              <div className="space-y-2 md:space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-lg md:text-3xl font-bold text-purple-600 mb-1">
                    {selectedItem.name}
                  </h3>
                  <p className="text-xs md:text-base text-purple-400">
                    🎨 Unique digital masterpiece
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-purple-400/10 rounded-lg md:rounded-xl">
                    <p className="text-[0.65rem] md:text-xs text-purple-400 mb-1">
                      ✨ Rarity Score
                    </p>
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-xl md:text-2xl font-bold text-pink-500">
                        {selectedItem.rarity}
                      </span>
                      <div className="w-10 md:w-12 h-1.5 md:h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                          style={{ width: `${selectedItem.rarity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-2 md:p-3 bg-purple-400/10 rounded-lg md:rounded-xl">
                    <p className="text-[0.65rem] md:text-xs text-purple-400 mb-1">
                      💰 Last Price
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xl md:text-2xl font-bold text-pink-500">
                        {selectedItem.price?.toFixed(2)}
                      </span>
                      <span className="text-base md:text-lg text-pink-500">
                        Ξ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traits */}
                <div className="space-y-1 md:space-y-3">
                  <h4 className="text-sm md:text-lg font-bold text-purple-600">
                    🎨 Traits
                  </h4>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {Object.entries(selectedItem.traits).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-purple-400/10 text-purple-600 text-[0.65rem] md:text-xs rounded-full flex items-center gap-1"
                      >
                        <span className="text-xs">🌟</span>
                        <span className="truncate">
                          {key}: {value}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col xs:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2 text-xs md:text-sm rounded-lg shadow-md hover:shadow-lg transition-all">
                    🛍️ Buy Now
                  </button>
                  <button className="flex-1 border-2 border-purple-600 text-purple-600 py-2 text-xs md:text-sm rounded-lg hover:bg-purple-400/10">
                    💌 Make Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
