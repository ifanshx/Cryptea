"use client";

import {
  StakeZephyrABI,
  StakeZephyrAddress,
  ZephyrusABI,
  ZephyrusAddress,
} from "@/constants/ZephyrusAbi";
import { CurrencyDollarIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { formatEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
} from "wagmi";

const HomePage = () => {
  const { address, isConnected } = useAccount();

  // Get user's NFT balance
  const { data: mintedCount } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  // Get native token balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  type StakeInfoOutput = {
    tokenId: bigint;
    startTime: bigint;
    claimableReward: bigint;
  };

  const { data: stakedResults } = useReadContracts({
    contracts: [
      {
        address: StakeZephyrAddress,
        abi: StakeZephyrABI,
        functionName: "getStakeInfo",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
  });

  // Hitung jumlah NFT yang di-stake
  const stakedCount = useMemo(() => {
    if (!stakedResults || !stakedResults[0]?.result) return 0;
    return (stakedResults[0].result as StakeInfoOutput[]).length;
  }, [stakedResults]);

  const totalRewards = useMemo(() => {
    if (!stakedResults || !stakedResults[0]?.result) return "0.00";

    const stakes = stakedResults[0].result as StakeInfoOutput[];
    return stakes
      .reduce((acc, stake) => {
        return acc + parseFloat(formatEther(stake.claimableReward));
      }, 0)
      .toFixed(5);
  }, [stakedResults]);

  // Stats configuration
  const stats = [
    {
      title: "Wallet Balance",
      value: `${balanceData?.formatted.slice(0, 5) || "0.00"} ${balanceData?.symbol || "TEA"
        }`,
      icon: CurrencyDollarIcon,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Your Entities",
      value: mintedCount,
      icon: PhotoIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Your Entities Staked",
      value: stakedCount,
      icon: PhotoIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Staked Rewards",
      value: `${totalRewards} TEA`, // Gunakan nilai yang sudah dihitung
      icon: CurrencyDollarIcon,
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Hero Section */}
      <div className="text-center mb-8 w-full space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse" />

          <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Ethereal Entities
          </h1>

        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-fade-in-up delay-100">
          Where digital art meets blockchain magic. Create, collect, and trade
          unique generated entities in a tea ecosystem.
        </p>
      </div>

      {/* Stats Section */}
      {isConnected && (
        <div className="w-full max-w-6xl animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.title}
                className={`bg-gradient-to-br ${stat.color}  relative h-48 overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 group`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl p-px">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `float ${Math.random() * 6 + 3}s infinite`,
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative flex flex-col h-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/5 backdrop-blur-sm">
                      <stat.icon className="w-6 h-6 text-white/90 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="text-sm font-medium text-white/80">
                      {stat.title}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <p className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>

                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute -inset-20 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -rotate-45" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-20 opacity-10 [mask-image:linear-gradient(180deg,transparent,rgba(0,0,0,0.6))]">
        <div className="h-full w-full [background-size:24px_24px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.3)_1px,transparent_1px)]" />
      </div>
    </div>
  );
};

export default HomePage;
