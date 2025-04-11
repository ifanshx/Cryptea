"use client";
import React, { useEffect, useState } from "react";
import data from "@/config/data.json";
import rarityData from "@/config/rarity.json";
import { AdjustmentsHorizontalIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const processedData = data.map(item => ({
      id: item.dna,
      name: item.name,
      image: item.image,
      edition: item.edition,
      traits: item.attributes.reduce((acc, attr) => {
        acc[attr.trait_type] = attr.value;
        return acc;
      }, {} as Record<string, string>),
      rarity: Math.floor(Math.random() * 100),
      price: Math.random() * 10
    }));
    setItems(processedData);
    setFilteredItems(processedData);
  }, []);

  useEffect(() => {
    let results = [...items];

    if (searchQuery) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTraits.length > 0) {
      results = results.filter(item =>
        selectedTraits.every(trait =>
          Object.values(item.traits).includes(trait)
        )
      );
    }

    setFilteredItems(results);
  }, [searchQuery, selectedTraits, items]);

  const handleTraitSelect = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
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
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      {/* Header Section */}
      <header className="mb-8 mt-12 text-center animate-fade-in">
        <div className="relative inline-block animate-float">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse-slow" />
          <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
            Ethereal Gallery
            <span className="block mt-2 text-xl text-purple-400 font-normal">
              by Digital Collectibles
            </span>
          </h1>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4 animate-slide-down">
        <div className="relative group max-w-2xl mx-auto">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-24 py-4 rounded-2xl border-2 border-purple-400/30 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 bg-white/80 backdrop-blur-sm placeholder-purple-400/60 transition-all shadow-lg font-medium text-purple-600"
            placeholder="🔍 Search NFTs..."
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-purple-400/20 text-purple-600 text-sm rounded-lg shadow-sm">
            ⌘K
          </kbd>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <AdjustmentsHorizontalIcon className="w-6 h-6 text-pink-500" />
            <span className="font-medium">Active Filters:</span>
          </div>

          {selectedTraits.map(trait => (
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
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] pb-8">
        {/* Filter Sidebar */}
        <aside className="lg:w-72 h-full overflow-y-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-400/20 p-4">
          <div className="space-y-4">
            {Object.entries(rarityData).map(([category, traits]) => (
              <div key={category} className="border-b-2 border-purple-400/20 last:border-0">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex justify-between items-center p-3 hover:bg-purple-400/10 rounded-xl transition-colors hover:scale-[1.02]"
                >
                  <span className="text-sm font-medium text-purple-600">🌿 {category}</span>
                  <PlusIcon className={`w-5 h-5 text-pink-500 transform ${openCategories[category] ? 'rotate-45' : ''} transition-transform`} />
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
                        <span className="flex-1 truncate text-purple-600">🪴 {trait.trait}</span>
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
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start overflow-y-auto">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group bg-white/80 backdrop-blur-sm border-2 border-purple-400/20 rounded-2xl cursor-pointer shadow-lg  hover:shadow-xl transition-all h-64 flex flex-col"
              onClick={() => openModal(item)}
            >
              <div className="relative h-48 w-full p-10 flex-shrink-0 overflow-hidden rounded-t-2xl">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />

              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-bold truncate text-purple-600">{item.name}</h3>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-purple-400">💎 Last Price:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-pink-500">
                      {item.price?.toFixed(2) || '--'}
                    </span>
                    <span className="text-pink-500">Ξ</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {isOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-purple-400 transition-all">
            <div className="p-4 border-b-2 border-purple-400/20 flex justify-between items-center bg-purple-400/10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                ✨ NFT Details
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-purple-400/20 rounded-full transition-colors hover:rotate-180"
              >
                <XMarkIcon className="w-6 h-6 text-purple-600" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-400/10 to-pink-50 hover:scale-103 transition-transform">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-50/50 to-transparent" />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-purple-600"> {selectedItem.name}</h3>
                  <p className="text-purple-400">🎨 Unique digital masterpiece stored on blockchain</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-400/10 rounded-xl">
                    <p className="text-xs text-purple-400 mb-1">✨ Rarity Score</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-pink-500">
                        {selectedItem.rarity}
                      </span>
                      <div className="w-12 h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-1000"
                          style={{ width: `${selectedItem.rarity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-400/10 rounded-xl">
                    <p className="text-xs text-purple-400 mb-1">💰 Last Price</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-pink-500">
                        {selectedItem.price?.toFixed(2)}
                      </span>
                      <span className="text-lg text-pink-500">Ξ</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-purple-600">🎨 Special Traits</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedItem.traits).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-3 py-1.5 bg-purple-400/10 text-purple-600 text-xs rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <span className="text-sm">🌟</span>
                        <span>{key}: {value}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 text-sm rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold"
                  >
                    🛍️ Buy Now
                  </button>
                  <button
                    className="flex-1 border-2 border-purple-600 text-purple-600 py-3 text-sm rounded-xl hover:bg-purple-400/10 transition-all hover:scale-105"
                  >
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