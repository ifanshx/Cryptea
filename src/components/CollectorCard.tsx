"use client"

import Image from "next/image";

interface CollectorCardProps {
    rank: string;
    avatar: string;
    address: string;
    amount: string;
    className?: string;
    style?: React.CSSProperties;
}

const CollectorCard = ({
    rank,
    avatar,
    address,
    amount,
    className = "",
    style
}: CollectorCardProps) => {
    return (
        <div
            className={`flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md shadow-md
                  hover:bg-white/20 transition-all duration-300 group
                  ${className}`}
            style={style}
        >
            {/* Ranking Badge */}
            <div className="text-lg font-bold text-black/80 group-hover:text-black transition-colors">
                #{rank}
            </div>

            {/* Avatar Image */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-110">
                <Image
                    src={avatar}
                    alt={`Collector ${address}`}
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
                    className="object-cover"
                />
            </div>

            {/* Collector Info */}
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-black truncate transition-colors group-hover:text-primary">
                    {address}
                </div>
                <div className="text-sm text-black/80 group-hover:text-primary/80 transition-colors">
                    {amount} $TEA
                </div>
            </div>
        </div>
    );
};

export default CollectorCard;