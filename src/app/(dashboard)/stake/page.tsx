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

import { useToast } from "@/context/ToastContext";
import {
  ZephyrusAddress,
  ZephyrusABI,
  StakeZephyrAddress,
  StakeZephyrABI,
} from "@/constants/ZephyrusAbi";
import Image from "next/image";
import { Loader, Sparkles, Wallet } from "lucide-react";

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

const leaderboard = [
  {
    address: "0x32...A5C4",
    avatar: "/assets/EtherealEntities.png",
    amount: 200_000,
  },
  { address: "0x32...A5C4", avatar: "/assets/rabbits.png", amount: 20_000 },
  {
    address: "0x32...A5C4",
    avatar: "/assets/EtherealEntities.png",
    amount: 2_000,
  },
  { address: "0x32...A5C4", avatar: "/assets/rabbits.png", amount: 1_000 },
  {
    address: "0x32...A5C4",
    avatar: "/assets/EtherealEntities.png",
    amount: 900,
  },
  { address: "0x32...A5C4", avatar: "/assets/rabbits.png", amount: 500 },
  {
    address: "0x32...A5C4",
    avatar: "/assets/EtherealEntities.png",
    amount: 60,
  },
  { address: "You", avatar: "/assets/EtherealEntities.png", amount: 7 },
];

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
      stakeInfos.map(({ tokenId, claimableReward }) => ({
        id: tokenId.toString(),
        tokenId: Number(tokenId),
        image: `/assets/rabbits.png`,
        name: `Zephyrus #${Number(tokenId)}`,
        isStaked: true,
        claimableReward, // Tambahkan claimable reward
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
        onError: (error) => {
          showToast(error.message || "Approval failed", "error");
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
        onError: (error) => {
          showToast(error.message || "Staking failed", "error");
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
        onError: (error) => {
          showToast(error.message || "Unstaking failed", "error");
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
        onError: (error) => {
          showToast(error.message || "Claim failed", "error");
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
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
            Earn Rewards with Your Digital Assets
          </h1>

          {/* Tabs */}
          <div className="flex space-x-4 overflow-x-auto">
            {['owned', 'staked'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "owned" | "staked")}
                className={
                  `flex items-center gap-2 px-4 py-2 rounded-full transition shadow-sm whitespace-nowrap ` +
                  (activeTab === tab
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 border hover:bg-gray-100')
                }
              >
                {tab === 'owned' ? <Wallet className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                {tab === 'owned' ? `Owned (${ownedNFTs.length})` : `Staked (${stakedNFTs.length})`}
              </button>
            ))}
          </div>

          {/* Content Panel with Scroll */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                {activeTab === 'owned' ? 'Your NFTs' : 'Staked NFTs'}
                {isLoading && <Loader className="w-5 h-5 animate-spin text-gray-400" />}
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-200"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "id")}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="newest">Newest</option>
                  <option value="id">ID</option>
                </select>
              </div>
            </div>

            {filteredNFTs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5  max-h-[600px] sm:max-h-[700px] overflow-y-auto">
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
              <div className="py-12 text-center text-gray-500">
                {isLoading ? 'Loading...' : 'No NFTs found'}
              </div>
            )}
          </div>




          {/* Stake & Rewards Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {activeTab === "owned" && !isApproved && (
              <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between items-center">
                <span className="text-gray-500 text-sm">
                  {activeTab === "owned" ? "Stake Options" : "Unstake"}
                </span>
                <button
                  onClick={handleApprove}
                  className="mt-4 bg-teal-500 text-white rounded-full px-8 py-2 hover:opacity-90 transition"
                  disabled={isPending}
                >
                  {isPending ? <Loader className="w-5 h-5 animate-spin" /> : 'Approve'}

                </button>
              </div>
            )}
            {(activeTab === "staked" ||
              (activeTab === "owned" && isApproved)) && (
                <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">
                      {activeTab === "owned" ? "Stake Options" : "Unstake"}
                    </span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">
                      {selectedNFTs.length} NFT{selectedNFTs.length !== 1 && 's'}

                    </span>
                  </div>
                  <button
                    onClick={activeTab === "owned" ? handleStake : handleUnstake}
                    disabled={!selectedNFTs.length || isPending}
                    className="mt-4 bg-teal-500 text-white rounded-full px-8 py-2 hover:opacity-90 transition"
                  >
                    {isPending ? <Loader className="w-5 h-5 animate-spin" /> : activeTab === 'owned' ? 'Stake' : 'Unstake'}

                  </button>
                </div>
              )}

            <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Rewards Overview</span>
                <span className="text-3xl font-bold text-gray-900 mt-2">
                  {totalRewards} CTEA
                </span>
              </div>
              <button
                onClick={handleClaim}
                disabled={!selectedNFTs.length || isPending}
                className="mt-4 bg-teal-500 text-white rounded-full px-8 py-2 hover:opacity-90 transition"
              >
                {isPending ? <Loader className="w-5 h-5 animate-spin" /> : 'Claim'}

              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <aside className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
          <div className="bg-white rounded-2xl shadow overflow-y-auto max-h-[500px]">
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-4 py-3 transition ` +
                  (entry.address === 'You'
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'hover:bg-gray-50')
                }
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="w-6 font-medium">{idx + 1}.</span>
                  <div className="w-8 h-8 relative rounded-full overflow-hidden">
                    <Image
                      src={entry.avatar}
                      alt={entry.address}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <span className="truncate text-base max-w-[6rem]">{entry.address}</span>
                </div>
                <span className="font-semibold text-base">{entry.amount.toLocaleString()} CTEA</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div >
  );
};

export default StakePage;
