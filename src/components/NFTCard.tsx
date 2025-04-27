"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

interface NFTCardProps {
  nft: {
    id: string;
    image: string;
    name: string;
    price?: number;
  };
  index?: number;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, index = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const idNumber = parseInt(nft.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <div
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden 
        hover:transform hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
    >
      <div className="relative h-60 bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative w-full h-full perspective-1000"
            style={{
              transform: `rotateX(${mousePosition.y * 8}deg) rotateY(${-mousePosition.x * 8
                }deg)`,
            }}
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover transform transition-transform duration-500 
                group-hover:scale-105"
              style={{
                transform: `translate(
                  ${mousePosition.x * 15}px, 
                  ${mousePosition.y * 15}px
                )`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {nft.name} #{idNumber}
        </h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-purple-600 font-bold">
              {nft.price?.toFixed(1) || (100 + idNumber * 20).toFixed(2)} TEA
            </p>
          </div>
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl transition-all 
            flex items-center gap-2 hover:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
