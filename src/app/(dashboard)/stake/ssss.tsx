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
    Sparkles,
    Wallet,
    RefreshCw,
    Gift,
    Search,
    Send,
    Repeat,
    Image as ImageIcon,
    Cpu,
} from "lucide-react";
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

    // reset on tab change
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
            (ownedResults?.[0]?.status === "success"
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
        const res = stakedResults?.[0];
        return res?.status === "success" && Array.isArray(res.result)
            ? (res.result as StakeInfoOutput[])
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
                claimableReward,
                stakingDuration: Math.floor((Date.now() / 1000 - Number(startTime)) / 86400),
                startTime: Number(startTime),
            })),
        [stakeInfos]
    );

    // —— Watch events ——
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

    // —— Calculate total rewards ——
    useEffect(() => {
        const total = selectedNFTs.reduce((acc, tokenId) => {
            const reward = stakeInfos.find((info) => Number(info.tokenId) === tokenId)
                ?.claimableReward;
            return reward ? acc + Number(formatEther(reward)) : acc;
        }, 0);
        setTotalRewards(total.toFixed(3));
    }, [stakeInfos, selectedNFTs]);

    // —— Contract writes & receipts ——
    const { writeContract, isPending } = useWriteContract();
    const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: txHashes.approve });
    const { isSuccess: isStakeConfirmed } = useWaitForTransactionReceipt({ hash: txHashes.stake });
    const { isSuccess: isUnstakeConfirmed } = useWaitForTransactionReceipt({ hash: txHashes.unstake });
    const { isSuccess: isClaimConfirmed } = useWaitForTransactionReceipt({ hash: txHashes.claim });

    // toast on confirmations
    useEffect(() => {
        if (isApproveConfirmed) {
            showToast("Approval confirmed!", "success");
            refetchApproval();
            setTxHashes((p) => ({ ...p, approve: undefined }));
        }
    }, [isApproveConfirmed]);
    useEffect(() => {
        if (isStakeConfirmed) {
            showToast("Staked! 🎉", "success");
            refetchStakes();
            setTxHashes((p) => ({ ...p, stake: undefined }));
        }
    }, [isStakeConfirmed]);
    useEffect(() => {
        if (isUnstakeConfirmed) {
            showToast("Unstaked! 🔄", "success");
            refetchStakes();
            setTxHashes((p) => ({ ...p, unstake: undefined }));
        }
    }, [isUnstakeConfirmed]);
    useEffect(() => {
        if (isClaimConfirmed) {
            showToast("Rewards claimed! 🎁", "success");
            refetchStakes();
            setTxHashes((p) => ({ ...p, claim: undefined }));
        }
    }, [isClaimConfirmed]);

    // —— Handlers ——
    const handleApprove = useCallback(() => {
        if (!address) return showToast("Connect wallet first", "error");
        writeContract(
            {
                address: ZephyrusAddress,
                abi: ZephyrusABI,
                functionName: "setApprovalForAll",
                args: [StakeZephyrAddress, true],
            },
            {
                onSuccess: (hash) => {
                    setTxHashes((p) => ({ ...p, approve: hash }));
                    showToast("Submitting approval...", "info");
                },
                onError: () => showToast("Approval failed", "error"),
            }
        );
    }, [address, writeContract]);

    const handleStake = useCallback(() => {
        if (!address) return showToast("Connect wallet first", "error");
        if (!selectedNFTs.length) return showToast("Select NFTs to stake", "warning");
        writeContract(
            {
                address: StakeZephyrAddress,
                abi: StakeZephyrABI,
                functionName: "stakeNFTs",
                args: [selectedNFTs.map(BigInt)],
            },
            {
                onSuccess: (hash) => {
                    setTxHashes((p) => ({ ...p, stake: hash }));
                    showToast("Submitting stake...", "info");
                },
                onError: () => showToast("Stake failed", "error"),
            }
        );
    }, [address, selectedNFTs]);

    const handleUnstake = useCallback(() => {
        if (!address) return showToast("Connect wallet first", "error");
        if (!selectedNFTs.length) return showToast("Select NFTs to unstake", "warning");
        writeContract(
            {
                address: StakeZephyrAddress,
                abi: StakeZephyrABI,
                functionName: "unstakeNFTs",
                args: [selectedNFTs.map(BigInt)],
            },
            {
                onSuccess: (hash) => {
                    setTxHashes((p) => ({ ...p, unstake: hash }));
                    showToast("Submitting unstake...", "info");
                },
                onError: () => showToast("Unstake failed", "error"),
            }
        );
    }, [address, selectedNFTs]);

    const handleClaim = useCallback(() => {
        if (!address) return showToast("Connect wallet first", "error");
        if (!selectedNFTs.length) return showToast("Select NFTs to claim", "warning");
        writeContract(
            {
                address: StakeZephyrAddress,
                abi: StakeZephyrABI,
                functionName: "claimRewardsBatch",
                args: [selectedNFTs.map(BigInt)],
            },
            {
                onSuccess: (hash) => {
                    setTxHashes((p) => ({ ...p, claim: hash }));
                    showToast("Submitting claim...", "info");
                },
                onError: () => showToast("Claim failed", "error"),
            }
        );
    }, [address, selectedNFTs]);

    // approval status
    const { data: isApproved, refetch: refetchApproval } = useReadContract({
        address: ZephyrusAddress,
        abi: ZephyrusABI,
        functionName: "isApprovedForAll",
        args: [address ?? "0x", StakeZephyrAddress],
        query: { enabled: !!address },
    });

    // filter & sort
    const filteredNFTs = useMemo(() => {
        const arr = activeTab === "owned" ? ownedNFTs : stakedNFTs;
        return arr
            .filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) =>
                sortBy === "newest" ? b.tokenId - a.tokenId : a.tokenId - b.tokenId
            );
    }, [activeTab, ownedNFTs, stakedNFTs, searchQuery, sortBy]);

    const isLoading = activeTab === "owned" ? loadingOwned : loadingStaked;

    // dummy leaderboard data — tinggal ganti dengan data on-chain
    const leaderboard = [
        { rank: 1, addr: "0x32...A5C4", reward: "200.000 CTEA" },
        { rank: 2, addr: "0x87...FF12", reward: "20.000 CTEA" },
        { rank: 3, addr: "0x56...B3D7", reward: "2.000 CTEA" },
        { rank: 4, addr: "0xAA...9F8E", reward: "1.000 CTEA" },
        { rank: 5, addr: "0xFE...C1B2", reward: "900 CTEA" },
        { rank: 6, addr: "0xDD...E4A3", reward: "500 CTEA" },
        { rank: 7, addr: "0xCC...B7F1", reward: "60 CTEA" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <nav className="w-16 bg-white shadow-lg flex flex-col items-center py-4 space-y-6">
                <Cpu className="w-6 h-6 text-green-500" />
                <Send className="w-6 h-6 text-gray-400 hover:text-green-500 transition" />
                <Sparkles className="w-6 h-6 text-gray-400 hover:text-green-500 transition" />
                <Repeat className="w-6 h-6 text-gray-400 hover:text-green-500 transition" />
                <ImageIcon className="w-6 h-6 text-gray-400 hover:text-green-500 transition" />
            </nav>

            {/* Main area */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Collection"
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-200"
                        />
                    </div>
                    <div className="flex items-center space-x-6 text-gray-600">
                        <span>0.00 CTEA</span>
                        <span>0.00 TEA</span>
                        <button className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                            <Wallet className="w-5 h-5" />
                            <span>Connect Wallet</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 flex overflow-hidden">
                    {/* Stake section */}
                    <section className="flex-1 p-6 overflow-auto">
                        {/* Title & Tabs */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">
                                Stake n earn rewards with your digital assets
                            </h2>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setActiveTab("owned")}
                                    className={`px-5 py-2 rounded-full font-medium ${activeTab === "owned"
                                        ? "bg-green-400 text-white"
                                        : "bg-white border border-gray-200 text-gray-600"
                                        }`}
                                >
                                    Owned
                                </button>
                                <button
                                    onClick={() => setActiveTab("staked")}
                                    className={`px-5 py-2 rounded-full font-medium ${activeTab === "staked"
                                        ? "bg-white text-gray-800 border border-green-400"
                                        : "bg-white border border-gray-200 text-gray-600"
                                        }`}
                                >
                                    Staked
                                </button>
                            </div>
                        </div>

                        {/* NFT Grid */}
                        <div className="bg-white rounded-2xl shadow p-6">
                            {filteredNFTs.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredNFTs.map((nft) => (
                                        <StakeCard
                                            key={nft.id}
                                            nft={nft}
                                            isSelected={selectedNFTs.includes(nft.tokenId)}
                                            onSelect={() =>
                                                setSelectedNFTs((prev) =>
                                                    prev.includes(nft.tokenId)
                                                        ? prev.filter((i) => i !== nft.tokenId)
                                                        : [...prev, nft.tokenId]
                                                )
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-20">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <RefreshCw className="w-6 h-6 animate-spin" />
                                            <span>Loading NFTs...</span>
                                        </div>
                                    ) : (
                                        "No NFTs found"
                                    )}
                                </div>
                            )}

                            {/* Bottom actions */}
                            <div className="flex flex-col sm:flex-row sm:justify-between mt-6 space-y-4 sm:space-y-0">
                                {/* Stake Overview */}
                                <div className="flex-1 bg-white border border-green-200 rounded-xl shadow p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">Stake Overview</div>
                                        <div className="text-xl font-bold text-gray-800">
                                            {selectedNFTs.length || ownedNFTs.length} NFTs
                                        </div>
                                    </div>
                                    <button
                                        onClick={!isApproved && activeTab === "owned" ? handleApprove : handleStake}
                                        disabled={isPending || (!isApproved && activeTab === "owned" ? false : !selectedNFTs.length)}
                                        className={`px-6 py-2 rounded-lg font-medium ${isPending
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-green-400 text-white hover:bg-green-500"
                                            }`}
                                    >
                                        {isPending ? (
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                                        ) : activeTab === "owned" && !isApproved ? (
                                            "Approve"
                                        ) : activeTab === "owned" ? (
                                            `Stake ${selectedNFTs.length}`
                                        ) : (
                                            `Unstake ${selectedNFTs.length}`
                                        )}
                                    </button>
                                </div>
                                {/* Reward Overview */}
                                <div className="flex-1 bg-white border border-green-200 rounded-xl shadow p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">Reward Overview</div>
                                        <div className="text-xl font-bold text-gray-800">{totalRewards} CTEA</div>
                                    </div>
                                    <button
                                        onClick={handleClaim}
                                        disabled={isPending || !selectedNFTs.length}
                                        className={`px-6 py-2 rounded-lg font-medium ${isPending
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-green-400 text-white hover:bg-green-500"
                                            }`}
                                    >
                                        {isPending ? (
                                            <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                                        ) : (
                                            `Claim`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Leaderboard */}
                    <aside className="w-80 p-6 bg-white shadow-lg overflow-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Leaderboard</h3>
                        <ul className="space-y-2">
                            {leaderboard.map((entry) => (
                                <li
                                    key={entry.rank}
                                    className={`flex items-center justify-between p-3 rounded-lg ${entry.rank === 11 ? "bg-green-50 border border-green-200" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <span className="font-medium text-gray-700">{entry.rank}.</span>
                                    <span className="text-gray-600 flex-1 mx-2">{entry.addr === address ? "You" : entry.addr}</span>
                                    <span className="font-semibold text-gray-800">{entry.reward}</span>
                                </li>
                            ))}
                            {/* contoh highlight posisi 11 */}
                            <li className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <span className="font-medium text-gray-700">11.</span>
                                <span className="text-gray-600 flex-1 mx-2">You</span>
                                <span className="font-semibold text-gray-800">7 CTEA</span>
                            </li>
                        </ul>
                    </aside>
                </main>
            </div>
        </div>
    );
};

export default StakePage;
