"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWatchContractEvent,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import StakeCard from "@/components/StakeCard";
import {
  SparklesIcon,
  WalletIcon,
  ArrowPathIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import {
  ZephyrusAddress,
  ZephyrusABI,
  StakeZephyrAddress,
  StakeZephyrABI,
} from "@/constants/ZephyrusAbi";

interface NFT {
  id: string;
  tokenId: number;
  image: string;
  name: string;
  isStaked: boolean;
}

type StakeInfoOutput = {
  tokenId: bigint;
  startTime: bigint;
  claimableReward: bigint;
};

const StakePage = () => {
  const { showToast } = useToast();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"owned" | "staked">("owned");
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
  const [totalRewards, setTotalRewards] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "id">("newest");
  const [txHashes, setTxHashes] = useState<{
    approve?: `0x${string}`;
    stake?: `0x${string}`;
    unstake?: `0x${string}`;
    claim?: `0x${string}`;
  }>({});

  // Reset selected NFTs when tab changes
  useEffect(() => setSelectedNFTs([]), [activeTab]);

  // —— Read owned NFTs ——
  const { data: ownedResults, isPending: loadingOwned } = useReadContracts({
    contracts: [
      {
        address: ZephyrusAddress,
        abi: ZephyrusABI,
        functionName: "tokensOfOwner",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
  });

  const ownedTokenIds = useMemo(
    () =>
      (ownedResults?.[0]?.status === "success" && ownedResults[0].result
        ? (ownedResults[0].result as bigint[])
        : []
      ).map(Number),
    [ownedResults]
  );

  const ownedNFTs: NFT[] = useMemo(
    () =>
      ownedTokenIds.map((tokenId) => ({
        id: tokenId.toString(),
        tokenId,
        image: `/assets/rabbits.png`,
        name: `Zephyrus #${tokenId}`,
        isStaked: false,
      })),
    [ownedTokenIds]
  );

  // —— Read staked NFTs ——
  const {
    data: stakedResults,
    refetch: refetchStakes,
    isPending: loadingStaked,
  } = useReadContracts({
    contracts: [
      {
        address: StakeZephyrAddress,
        abi: StakeZephyrABI,
        functionName: "getStakeInfo",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
      },
    ],
  });

  const stakeInfos = useMemo(() => {
    const result = stakedResults?.[0];
    return result?.status === "success" && Array.isArray(result.result)
      ? (result.result as StakeInfoOutput[])
      : [];
  }, [stakedResults]);

  const stakedNFTs: NFT[] = useMemo(
    () =>
      stakeInfos.map(({ tokenId, claimableReward, startTime }) => ({
        id: tokenId.toString(),
        tokenId: Number(tokenId),
        image: `/assets/rabbits.png`,
        name: `Zephyrus #${Number(tokenId)}`,
        isStaked: true,
        claimableReward, // Tambahkan claimable reward
        stakingDuration: Math.floor((Date.now() / 1000 - Number(startTime)) / 86400),
        startTime: Number(startTime),
      })),
    [stakeInfos]
  );

  // —— Watch contract events ——
  useWatchContractEvent({
    address: StakeZephyrAddress,
    abi: StakeZephyrABI,
    eventName: "NFTStaked",
    onLogs: () => refetchStakes(),
  });

  useWatchContractEvent({
    address: StakeZephyrAddress,
    abi: StakeZephyrABI,
    eventName: "NFTUnstaked",
    onLogs: () => refetchStakes(),
  });

  // —— Calculate rewards ——
  useEffect(() => {
    const total = selectedNFTs.reduce((acc, tokenId) => {
      const reward = stakeInfos.find(
        (info) => Number(info.tokenId) === tokenId
      )?.claimableReward;
      return reward ? acc + Number(formatEther(reward)) : acc;
    }, 0);
    setTotalRewards(total.toFixed(4));
  }, [stakeInfos, selectedNFTs]);

  // —— Contract writes ——
  const { writeContract, isPending } = useWriteContract();
  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: txHashes.approve,
  });
  const { isSuccess: isStakeConfirmed } = useWaitForTransactionReceipt({
    hash: txHashes.stake,
  });
  const { isSuccess: isUnstakeConfirmed } = useWaitForTransactionReceipt({
    hash: txHashes.unstake,
  });
  const { isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({
    hash: txHashes.claim,
  });

  // —— Handle transaction confirmations ——
  useEffect(() => {
    if (isApproveConfirmed) {
      showToast("Approval confirmed!", "success");
      refetchApproval();
      setTxHashes((prev) => ({ ...prev, approve: undefined }));
    }
  }, [isApproveConfirmed]);

  useEffect(() => {
    if (isStakeConfirmed) {
      showToast("NFTs staked successfully!", "success");
      refetchStakes();
      setTxHashes((prev) => ({ ...prev, stake: undefined }));
    }
  }, [isStakeConfirmed]);

  useEffect(() => {
    if (isUnstakeConfirmed) {
      showToast("NFTs unstaked successfully!", "success");
      refetchStakes();
      setTxHashes((prev) => ({ ...prev, unstake: undefined }));
    }
  }, [isUnstakeConfirmed]);

  useEffect(() => {
    if (isClaimConfirmed) {
      showToast("Rewards claimed successfully!", "success");
      refetchStakes();
      setTxHashes((prev) => ({ ...prev, claim: undefined }));
    }
  }, [isClaimConfirmed]);

  // —— Approval handler ——
  const handleApprove = useCallback(() => {
    if (!address) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    writeContract(
      {
        address: ZephyrusAddress,
        abi: ZephyrusABI,
        functionName: "setApprovalForAll",
        args: [StakeZephyrAddress, true],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, approve: hash }));
          showToast("Approval transaction submitted...", "info");
        },
        onError: () => {
          showToast("Approval failed", "error");
        },
      }
    );
  }, [address, writeContract, showToast]);

  // —— Stake handler ——
  const handleStake = useCallback(() => {
    if (!address) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    if (!selectedNFTs.length) {
      showToast("Please select NFTs to stake", "warning");
      return;
    }

    writeContract(
      {
        address: StakeZephyrAddress,
        abi: StakeZephyrABI,
        functionName: "stakeNFTs",
        args: [selectedNFTs.map(BigInt)],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, stake: hash }));
          showToast("Staking transaction submitted...", "info");
        },
        onError: () => {
          showToast("Staking failed", "error");
        },
      }
    );
  }, [address, writeContract, selectedNFTs, showToast]);

  // —— Unstake handler ——
  const handleUnstake = useCallback(() => {
    if (!address) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    if (!selectedNFTs.length) {
      showToast("Please select NFTs to unstake", "warning");
      return;
    }

    writeContract(
      {
        address: StakeZephyrAddress,
        abi: StakeZephyrABI,
        functionName: "unstakeNFTs",
        args: [selectedNFTs.map(BigInt)],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, unstake: hash }));
          showToast("Unstaking transaction submitted...", "info");
        },
        onError: () => {
          showToast("Unstaking failed", "error");
        },
      }
    );
  }, [address, writeContract, selectedNFTs, showToast]);

  // —— Claim handler ——
  const handleClaim = useCallback(() => {
    if (!address) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    if (!selectedNFTs.length) {
      showToast("Please select NFTs to claim", "warning");
      return;
    }

    writeContract(
      {
        address: StakeZephyrAddress,
        abi: StakeZephyrABI,
        functionName: "claimRewardsBatch",
        args: [selectedNFTs.map(BigInt)],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, claim: hash }));
          showToast("Claim transaction submitted...", "info");
        },
        onError: () => {
          showToast("Claim failed", "error");
        },
      }
    );
  }, [address, writeContract, selectedNFTs, showToast]);

  // —— Approval status ——
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "isApprovedForAll",
    args: [address ?? "0x", StakeZephyrAddress],
    query: { enabled: !!address },
  });

  // —— Filter & sort ——
  const filteredNFTs = useMemo(() => {
    const nfts = activeTab === "owned" ? ownedNFTs : stakedNFTs;
    return nfts
      .filter((nft) =>
        nft.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) =>
        sortBy === "newest" ? b.tokenId - a.tokenId : a.tokenId - b.tokenId
      );
  }, [activeTab, ownedNFTs, stakedNFTs, searchQuery, sortBy]);

  const isLoading = activeTab === "owned" ? loadingOwned : loadingStaked;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="relative inline-block animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse-slow" />
            <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              NFT Staking Platform
              <span className="block mt-2 text-xl text-purple-400 font-normal">
                Earn rewards with your digital assets
              </span>
            </h1>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center animate-slide-down">
          <button
            onClick={() => setActiveTab("owned")}
            className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${activeTab === "owned"
              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl"
              : "bg-white/80 text-gray-600 hover:bg-gray-50 border border-purple-400/20 backdrop-blur-sm"
              }`}
          >
            <WalletIcon className="w-5 h-5" />
            Owned ({ownedNFTs.length})
          </button>
          <button
            onClick={() => setActiveTab("staked")}
            className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${activeTab === "staked"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl"
              : "bg-white/80 text-gray-600 hover:bg-gray-50 border border-purple-400/20 backdrop-blur-sm"
              }`}
          >
            <SparklesIcon className="w-5 h-5" />
            Staked ({stakedNFTs.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-purple-400/20 animate-slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-purple-600">
                  {activeTab === "owned" ? "Your NFTs" : "Staked NFTs"}
                  {isLoading && (
                    <ArrowPathIcon className="w-5 h-5 animate-spin text-purple-400" />
                  )}
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 rounded-xl border-2 border-purple-400/30 focus:ring-2 focus:ring-purple-200 bg-white/80 backdrop-blur-sm placeholder-purple-400/60"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "newest" | "id")}
                    className="px-4 py-2 rounded-xl border-2 border-purple-400/30 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="newest">Newest</option>
                    <option value="id">ID</option>
                  </select>
                </div>
              </div>

              {filteredNFTs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredNFTs.map((nft) => (
                    <StakeCard
                      key={nft.id}
                      nft={nft}
                      isSelected={selectedNFTs.includes(nft.tokenId)}
                      onSelect={() =>
                        setSelectedNFTs((prev) =>
                          prev.includes(nft.tokenId)
                            ? prev.filter((id) => id !== nft.tokenId)
                            : [...prev, nft.tokenId]
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-purple-400/80">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      Loading NFTs...
                    </div>
                  ) : (
                    "No NFTs found matching your criteria"
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1 space-y-6 sticky top-6 h-fit">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-purple-400/20 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600">
                <ArrowPathIcon className="w-6 h-6 text-pink-500" />
                {activeTab === "owned" ? "Stake Options" : "Unstake"}
              </h3>

              {activeTab === "owned" && !isApproved && (
                <button
                  onClick={handleApprove}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all hover:scale-[1.02] mb-3"
                  disabled={isPending}
                >
                  {isPending ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Approve Staking"
                  )}
                </button>
              )}

              {(activeTab === "staked" ||
                (activeTab === "owned" && isApproved)) && (
                  <button
                    onClick={activeTab === "owned" ? handleStake : handleUnstake}
                    disabled={!selectedNFTs.length || isPending}
                    className={`w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-medium transition-all ${!isPending && "hover:shadow-xl hover:scale-[1.02]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isPending ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                    ) : activeTab === "owned" ? (
                      `Stake ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? "s" : ""}`
                    ) : (
                      `Unstake ${selectedNFTs.length} NFT${selectedNFTs.length !== 1 ? "s" : ""}`
                    )}
                  </button>
                )}
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-purple-400/20 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-600">
                <GiftIcon className="w-6 h-6 text-pink-500" />
                Rewards Overview
              </h3>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-400/10 rounded-xl p-4 mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  {totalRewards}
                </div>
                <div className="text-sm text-purple-400/80">TEA Earned</div>
              </div>
              <button
                onClick={handleClaim}
                disabled={!selectedNFTs.length || isPending}
                className={`w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl font-medium transition-all ${!isPending && "hover:shadow-xl hover:scale-[1.02]"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPending ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  `Claim ${totalRewards} TEA`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakePage;