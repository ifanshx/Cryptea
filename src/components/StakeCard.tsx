"use client";

import { useState, useRef, CSSProperties } from "react";
import { formatEther } from "viem";
import {
  SparklesIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

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

  const formatDuration = () => {
    if (!nft.stakingDuration) return "0d";
    const days = Math.floor(nft.stakingDuration);
    const hours = Math.round((nft.stakingDuration - days) * 24);
    return `${days}d ${hours}h`;
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
        ${isSelected ? "border-purple-400 bg-purple-50/20" : "border-purple-400/20"}
        ${nft.isEmergency ? "border-red-400/50 animate-pulse" : ""}
        ${nft.isStaked ? "opacity-100" : "hover:border-purple-400/40"} shadow-lg hover:shadow-xl transition-all`}
      style={cardStyle}
    >
      <div className="relative aspect-square">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-purple-900/40" />

        {/* Emergency state overlay */}
        {nft.isEmergency && (
          <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-purple-900/90 via-purple-900/50 to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-white truncate text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              {nft.name}
            </h3>
            <p className="text-xs text-purple-100/90 mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
              ID: #{nft.tokenId}
            </p>
          </div>

          {nft.startTimestamp && (
            <div className="text-right">
              <p className="text-xs text-purple-100/70">
                {new Date(nft.startTimestamp * 1000).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top badges */}
      <div className="absolute top-2 inset-x-2 flex justify-between">
        {/* Staking duration */}
        {nft.isStaked && (
          <div className="bg-purple-400/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1 border border-purple-400/30">
            <ClockIcon className="w-4 h-4 text-purple-200" />
            <span className="text-purple-100 font-medium">
              {formatDuration()}
            </span>
          </div>
        )}

        {/* Claimable reward */}
        {nft.claimableReward && (
          <div className="bg-green-400/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center gap-1 border border-green-400/30">
            <SparklesIcon className="w-4 h-4 text-green-200" />
            <span className="text-green-100 font-medium">
              +{formatReward(nft.claimableReward)}
            </span>
          </div>
        )}
      </div>

      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white animate-pulse-slow">
            <CheckIcon className="w-6 h-6" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeCard;