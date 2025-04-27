"use client";

import { useState, useRef, CSSProperties } from "react";
import { formatEther } from "viem";


import {
  Check,
  AlertTriangle
} from "lucide-react";


interface StakeCardProps {
  nft: {
    id: string;
    tokenId: number;
    image: string;
    name: string;
    isStaked: boolean;
    claimableReward?: bigint;
    stakingDuration?: number;
    startTimestamp?: number;
    isEmergency?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const StakeCard = ({ nft, isSelected, onSelect }: StakeCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const formatReward = (reward?: bigint) => {
    if (!reward) return "0.00";
    return parseFloat(formatEther(reward)).toFixed(2);
  };



  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
    const y = (e.clientY - rect.top - rect.height / 2) * -0.1;
    setMousePosition({ x, y });
  };

  const cardStyle: CSSProperties = {
    transform: `perspective(1000px) 
      rotateX(${mousePosition.y}deg) 
      rotateY(${mousePosition.x}deg) 
      scale(${isSelected ? 0.98 : 1})`,
    transition: "all 0.3s ease-out",
  };

  return (
    <div
      ref={cardRef}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
      className={`relative cursor-pointer group overflow-hidden rounded-2xl border-2 bg-white/5 backdrop-blur-sm
        ${isSelected ? "border-[#52c6a3] bg-purple-50/20" : "border-[#52c6a3]"}
        ${nft.isEmergency ? "border-[#52c6a3] animate-pulse" : ""}
        ${nft.isStaked ? "opacity-100" : "hover:border-purple-400/40"} shadow-lg hover:shadow-xl transition-all`}
      style={cardStyle}
    >
      <div className="relative aspect-square">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />


        {/* Emergency state overlay */}
        {nft.isEmergency && (
          <div className="absolute inset-0 bg-[#52c6a3] backdrop-blur-sm flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 ">
        <div className="flex justify-center items-start">
          {/* Claimable reward */}
          {nft.claimableReward && (
            <div className="bg-[#52c6a3] px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-green-400/30">
              <span className="text-green-100 font-medium">
                ⚡️+{formatReward(nft.claimableReward)} $CTEA
              </span>
            </div>
          )}
        </div>
      </div>



      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-10 h-10 bg-[#52c6a3] rounded-full flex items-center justify-center text-white animate-pulse-slow">
            <Check className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeCard;