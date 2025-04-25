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

import { Sparkles, Wallet, RefreshCw, Gift } from 'lucide-react';


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

    // Leaderboard data
    const leaderboard = useMemo(
        () => [
            { rank: 1, addr: '0x32…A5C4', reward: '200 CTEA' },
            { rank: 2, addr: '0x87…FF12', reward: '20 CTEA' },
            { rank: 3, addr: '0x56…B3D7', reward: '2 CTEA' },
            { rank: 4, addr: '0xAA…9F8E', reward: '1 CTEA' },
            { rank: 5, addr: '0xFE…C1B2', reward: '0.9 CTEA' },
            { rank: 6, addr: '0xDD…E4A3', reward: '0.5 CTEA' },
            { rank: 7, addr: '0xCC…B7F1', reward: '0.06 CTEA' },
        ],
        []
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                {/* Header */}
                <header className="text-center mb-8 md:mb-16 space-y-4 md:space-y-6">
                    <div className="relative inline-block animate-float">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse-slow" />
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 px-4">
                            Stake n earn rewards with your digital assets
                        </h2>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8 justify-center">
                    <button
                        onClick={() => setActiveTab("owned")}
                        className={`flex-1 md:flex-none px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center gap-2 transition-all duration-300 text-sm md:text-base ${activeTab === "owned"
                            ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                            : "bg-white/80 text-gray-600 hover:bg-gray-50 border border-purple-400/20"
                            }`}
                    >
                        <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                        Owned ({ownedNFTs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("staked")}
                        className={`flex-1 md:flex-none px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center gap-2 transition-all duration-300 text-sm md:text-base ${activeTab === "staked"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "bg-white/80 text-gray-600 hover:bg-gray-50 border border-purple-400/20"
                            }`}
                    >
                        <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                        Staked ({stakedNFTs.length})
                    </button>
                </div>

                <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-sm md:shadow-xl p-4 md:p-6 border border-purple-400/20">
                            <div className="flex flex-col gap-3 mb-4 md:mb-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg md:text-xl font-semibold text-purple-600">
                                        {activeTab === "owned" ? "Your NFTs" : "Staked NFTs"}
                                    </h2>
                                    {isLoading && (
                                        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg md:rounded-xl border-2 border-purple-400/30 focus:ring-2 focus:ring-purple-200 bg-white/80 placeholder-purple-400/60 text-sm md:text-base"
                                    />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as "newest" | "id")}
                                        className="px-3 py-2 rounded-lg md:rounded-xl border-2 border-purple-400/30 bg-white/80 focus:ring-2 focus:ring-purple-200 text-sm md:text-base"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="id">ID</option>
                                    </select>
                                </div>
                            </div>

                            {filteredNFTs.length > 0 ? (
                                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
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
                                <div className="text-center py-8 text-purple-400/80 text-sm md:text-base">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Loading NFTs...
                                        </div>
                                    ) : (
                                        "No NFTs found"
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="lg:col-span-1 space-y-4 md:space-y-6">
                        {/* Actions Card */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-sm md:shadow-xl p-4 md:p-6 border border-purple-400/20">
                            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2 text-purple-600">
                                <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
                                {activeTab === "owned" ? "Stake Options" : "Unstake"}
                            </h3>

                            {activeTab === "owned" && !isApproved && (
                                <button
                                    onClick={handleApprove}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium mb-2"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin mx-auto" />
                                    ) : (
                                        "Approve Staking"
                                    )}
                                </button>
                            )}

                            {(activeTab === "staked" || (activeTab === "owned" && isApproved)) && (
                                <button
                                    onClick={activeTab === "owned" ? handleStake : handleUnstake}
                                    disabled={!selectedNFTs.length || isPending}
                                    className={`w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium ${!isPending && "hover:opacity-90"
                                        } transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isPending ? (
                                        <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin mx-auto" />
                                    ) : activeTab === "owned" ? (
                                        `Stake ${selectedNFTs.length || ""}`
                                    ) : (
                                        `Unstake ${selectedNFTs.length || ""}`
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Rewards Card */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-sm md:shadow-xl p-4 md:p-6 border border-purple-400/20">
                            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2 text-purple-600">
                                <Gift className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
                                Rewards Overview
                            </h3>

                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-400/10 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4">
                                <div className="text-2xl md:text-3xl font-bold text-purple-600">
                                    {totalRewards}
                                </div>
                                <div className="text-xs md:text-sm text-purple-400/80">TEA Earned</div>
                            </div>

                            <button
                                onClick={handleClaim}
                                disabled={!selectedNFTs.length || isPending}
                                className={`w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium ${!isPending && "hover:opacity-90"
                                    } transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isPending ? (
                                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin mx-auto" />
                                ) : (
                                    `Claim ${totalRewards} TEA`
                                )}
                            </button>
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-sm md:shadow-xl p-4 md:p-6 border border-purple-400/20">
                            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-purple-600">
                                Leaderboard
                            </h3>

                            <div className="space-y-2">
                                {leaderboard.map(({ rank, addr, reward }) => (
                                    <div
                                        key={rank}
                                        className={`flex items-center p-2 rounded-lg text-sm ${rank === 11 ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="w-6 text-gray-500 font-medium">{rank}.</span>
                                        <span className="flex-1 text-gray-600 truncate mx-2">{addr}</span>
                                        <span className="text-gray-800 font-semibold">{reward}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StakePage;