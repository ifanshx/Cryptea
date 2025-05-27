// app/(routes)/stake/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  HerbivoresAddress,
  HerbivoresABI,
  StakeNFTAddress,
  StakeNFTABI,
} from "@/constants/ContractAbi";
import { Loader, Sparkles, Wallet } from "lucide-react";
import LeaderboardSticky from "@/components/LeaderboardSticky";

interface NFT {
  id: string;
  tokenId: number;
  image: string;
  name: string;
  isStaked: boolean;
  claimableReward?: bigint;
}

interface LeaderboardEntry {
  address: string;
  avatar: string; // Avatar harus ditentukan setelah fetching
  amount: number;
}

// --- KONSTAN UNTUK PESAN TOAST ---
const TOAST_MESSAGES = {
  CONNECT_WALLET: "Please connect your wallet first.",
  NO_NFT_SELECTED: "Please select NFTs for this operation.",
  TX_SUBMITTED: "Transaction submitted! Awaiting confirmation...",
  APPROVAL_CONFIRMED: "Approval confirmed!",
  STAKE_CONFIRMED: "NFTs staked successfully! 🥳",
  UNSTAKE_CONFIRMED: "NFTs unstaked successfully! 🎉",
  CLAIM_CONFIRMED: "Rewards claimed successfully! 💰",
  APPROVAL_FAILED: (msg: string) => `Approval failed: ${msg}`,
  STAKE_FAILED: (msg: string) => `Staking failed: ${msg}`,
  UNSTAKE_FAILED: (msg: string) => `Unstaking failed: ${msg}`,
  CLAIM_FAILED: (msg: string) => `Claim failed: ${msg}`,
  GENERIC_ERROR: "An unexpected error occurred.",
};

const StakePage = () => {
  const { showToast } = useToast();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"owned" | "staked">("owned");
  const [selectedNFTs, setSelectedNFTs] = useState<number[]>([]);
  const [totalPendingRewards, setTotalPendingRewards] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "id">("newest");
  const [txHashes, setTxHashes] = useState<{
    approve?: `0x${string}`;
    stake?: `0x${string}`;
    unstake?: `0x${string}`;
    claim?: `0x${string}`;
  }>({});

  // --- New state for global loading overlay ---
  const [showGlobalLoader, setShowGlobalLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Processing transaction...");

  // Refs to track previous transaction states for toasts
  const prevIsApproving = useRef(false);
  const prevIsStaking = useRef(false);
  const prevIsUnstaking = useRef(false);
  const prevIsClaiming = useRef(false);

  // --- State baru untuk Leaderboard Data ---
  const [realtimeLeaderboard, setRealtimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);

  // Fungsi untuk mengambil data leaderboard
  const fetchLeaderboardData = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    setErrorLeaderboard(null);
    try {
      const response = await fetch("/api/leaderboard"); // Panggil API Route leaderboard
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      const data: Omit<LeaderboardEntry, 'avatar'>[] = await response.json();

      // Tambahkan avatar placeholder atau logic untuk mendapatkan avatar di sini
      // Untuk tujuan demo, kita pakai avatar static sementara
      const processedData: LeaderboardEntry[] = data.map(entry => ({
        ...entry,
        avatar: entry.address === address ? "/assets/EtherealEntities.2.png" : "/assets/EtherealEntities.png" // Contoh avatar
      }));
      setRealtimeLeaderboard(processedData);
    } catch (err: unknown) {
      console.error("Error fetching leaderboard data:", err);
      setErrorLeaderboard(
        err instanceof Error ? err.message : "Failed to load leaderboard."
      );
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [address]); // Tambahkan address agar fetchLeaderboardData di-recreate jika address berubah

  // useEffect untuk memanggil fetchLeaderboardData saat komponen mount dan secara berkala
  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 30 * 1000); // Refresh setiap 30 detik
    return () => clearInterval(interval); // Cleanup interval
  }, [fetchLeaderboardData]);



  // Gunakan realtimeLeaderboard yang di-fetch
  const leaderboardData = useMemo(() => {
    const finalLeaderboard = [...realtimeLeaderboard];

    // Cek apakah alamat pengguna saat ini sudah ada di leaderboard
    const userIsInLeaderboard = realtimeLeaderboard.some(
      (entry) => entry.address.toLowerCase() === address?.toLowerCase()
    );

    // Jika pengguna terhubung dan belum ada di leaderboard yang di-fetch, tambahkan entry dummy
    if (address && !userIsInLeaderboard) {
      finalLeaderboard.push({
        address: address,
        avatar: "/assets/EtherealEntities.png", // Avatar untuk pengguna saat ini
        amount: 0, // Jumlah default, akan diupdate jika ada data on-chain
      });
    }

    return finalLeaderboard;
  }, [realtimeLeaderboard, address]);

  useEffect(() => setSelectedNFTs([]), [activeTab]);

  // --- Read owned NFTs ---
  const { data: ownedTokenIdsRaw, isPending: loadingOwned } = useReadContract({
    address: HerbivoresAddress,
    abi: HerbivoresABI,
    functionName: "tokensOfOwner",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!address && activeTab === "owned",
    },
  });

  const ownedTokenIds = useMemo(
    () =>
      Array.isArray(ownedTokenIdsRaw)
        ? (ownedTokenIdsRaw as bigint[]).map(Number)
        : [],
    [ownedTokenIdsRaw]
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

  // --- Read staked NFTs from CrypteaCollectionStaking ---
  const {
    data: stakedTokenIdsRaw,
    refetch: refetchStakedTokenIds,
    isPending: loadingStakedTokenIds,
  } = useReadContract({
    address: StakeNFTAddress,
    abi: StakeNFTABI,
    functionName: "stakedTokens",
    args: [HerbivoresAddress, address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!address && activeTab === "staked",
    },
  });

  const stakedTokenIds = useMemo(
    () =>
      Array.isArray(stakedTokenIdsRaw)
        ? (stakedTokenIdsRaw as bigint[]).map(Number)
        : [],
    [stakedTokenIdsRaw]
  );

  // --- Approval status ---
  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: HerbivoresAddress,
    abi: HerbivoresABI,
    functionName: "isApprovedForAll",
    args: [address || "0x", StakeNFTAddress],
    query: { enabled: !!address },
  });


  // Fetch individual earned rewards for staked NFTs
  const {
    data: earnedRewardsResults,
    refetch: refetchEarnedRewards,
    isPending: loadingEarnedRewards,
  } = useReadContracts<
    {
      status: "success" | "error" | "pending";
      result?: bigint;
      error?: unknown;
    }[]
  >({
    contracts: stakedTokenIds.map((tokenId) => ({
      address: StakeNFTAddress,
      abi: StakeNFTABI,
      functionName: "earned",
      args: [HerbivoresAddress, BigInt(tokenId)],
    })),
    query: {
      enabled: stakedTokenIds.length > 0 && activeTab === "staked",
    },
  });

  const stakedNFTs: NFT[] = useMemo(() => {
    return stakedTokenIds.map((tokenId, index) => {
      let earnedReward: bigint | undefined = undefined;
      if (
        earnedRewardsResults?.[index]?.status === "success" &&
        typeof earnedRewardsResults[index].result === "bigint"
      ) {
        earnedReward = earnedRewardsResults[index].result as bigint;
      }

      return {
        id: tokenId.toString(),
        tokenId,
        image: `/assets/rabbits.png`,
        name: `Zephyrus #${tokenId}`,
        isStaked: true,
        claimableReward: earnedReward,
      };
    });
  }, [stakedTokenIds, earnedRewardsResults]);


  // --- Watch contract events ---
  // Pastikan Anda juga merefresh leaderboard saat ada event stake/unstake
  useWatchContractEvent({
    address: StakeNFTAddress,
    abi: StakeNFTABI,
    eventName: "BatchStaked",
    onLogs: () => {
      refetchStakedTokenIds();
      refetchEarnedRewards();
      fetchLeaderboardData(); // <-- Tambahkan ini
    },
  });

  useWatchContractEvent({
    address: StakeNFTAddress,
    abi: StakeNFTABI,
    eventName: "BatchUnstaked",
    onLogs: () => {
      refetchStakedTokenIds();
      refetchEarnedRewards();
      fetchLeaderboardData(); // <-- Tambahkan ini
    },
  });

  useWatchContractEvent({
    address: StakeNFTAddress,
    abi: StakeNFTABI,
    eventName: "BatchClaimed",
    onLogs: () => {
      refetchStakedTokenIds();
      refetchEarnedRewards();
      // fetchLeaderboardData(); // Klaim reward tidak selalu mengubah peringkat stake
    },
  });

  useEffect(() => {
    const total = selectedNFTs.reduce((acc, tokenId) => {
      const nft = stakedNFTs.find((sNft) => sNft.tokenId === tokenId);
      return nft && nft.claimableReward !== undefined
        ? acc + Number(formatEther(nft.claimableReward))
        : acc;
    }, 0);
    setTotalPendingRewards(total.toFixed(4));
  }, [selectedNFTs, stakedNFTs]);

  // --- Contract writes ---
  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Using wagmi's `useWaitForTransactionReceipt` for confirmation status
  const { isSuccess: isApproveConfirmed, isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: txHashes.approve,
    query: { enabled: !!txHashes.approve }
  });
  const { isSuccess: isStakeConfirmed, isLoading: isStaking } = useWaitForTransactionReceipt({
    hash: txHashes.stake,
    query: { enabled: !!txHashes.stake }
  });
  const { isSuccess: isUnstakeConfirmed, isLoading: isUnstaking } = useWaitForTransactionReceipt({
    hash: txHashes.unstake,
    query: { enabled: !!txHashes.unstake }
  });
  const { isSuccess: isClaimConfirmed, isLoading: isClaiming } = useWaitForTransactionReceipt({
    hash: txHashes.claim,
    query: { enabled: !!txHashes.claim }
  });

  // Consolidated loading status
  const isAnyTxActive = isApproving || isStaking || isUnstaking || isClaiming;

  // --- Handle transaction confirmations and errors ---
  useEffect(() => {
    // APPROVE
    if (isApproving && !prevIsApproving.current) {
      setShowGlobalLoader(true);
      setLoaderMessage("Approving collection...");
    } else if (isApproveConfirmed) {
      showToast(TOAST_MESSAGES.APPROVAL_CONFIRMED, "success");
      refetchApproval();
      setTxHashes((prev) => ({ ...prev, approve: undefined }));
      setShowGlobalLoader(false);
    } else if (txHashes.approve && !isApproving && !isApproveConfirmed) {
      showToast(TOAST_MESSAGES.APPROVAL_FAILED("Transaction failed or rejected."), "error");
      setTxHashes((prev) => ({ ...prev, approve: undefined }));
      setShowGlobalLoader(false);
    }
    prevIsApproving.current = isApproving;

    // STAKE
    if (isStaking && !prevIsStaking.current) {
      setShowGlobalLoader(true);
      setLoaderMessage("Staking NFTs...");
    } else if (isStakeConfirmed) {
      showToast(TOAST_MESSAGES.STAKE_CONFIRMED, "success");
      refetchStakedTokenIds();
      refetchEarnedRewards();
      fetchLeaderboardData(); // Refresh leaderboard setelah stake
      setSelectedNFTs([]);
      setTxHashes((prev) => ({ ...prev, stake: undefined }));
      setShowGlobalLoader(false);
    } else if (txHashes.stake && !isStaking && !isStakeConfirmed) {
      showToast(TOAST_MESSAGES.STAKE_FAILED("Transaction failed or rejected."), "error");
      setTxHashes((prev) => ({ ...prev, stake: undefined }));
      setShowGlobalLoader(false);
    }
    prevIsStaking.current = isStaking;

    // UNSTAKE
    if (isUnstaking && !prevIsUnstaking.current) {
      setShowGlobalLoader(true);
      setLoaderMessage("Unstaking NFTs...");
    } else if (isUnstakeConfirmed) {
      showToast(TOAST_MESSAGES.UNSTAKE_CONFIRMED, "success");
      refetchStakedTokenIds();
      refetchEarnedRewards();
      fetchLeaderboardData(); // Refresh leaderboard setelah unstake
      setSelectedNFTs([]);
      setTxHashes((prev) => ({ ...prev, unstake: undefined }));
      setShowGlobalLoader(false);
    } else if (txHashes.unstake && !isUnstaking && !isUnstakeConfirmed) {
      showToast(TOAST_MESSAGES.UNSTAKE_FAILED("Transaction failed or rejected."), "error");
      setTxHashes((prev) => ({ ...prev, unstake: undefined }));
      setShowGlobalLoader(false);
    }
    prevIsUnstaking.current = isUnstaking;

    // CLAIM
    if (isClaiming && !prevIsClaiming.current) {
      setShowGlobalLoader(true);
      setLoaderMessage("Claiming rewards...");
    } else if (isClaimConfirmed) {
      showToast(TOAST_MESSAGES.CLAIM_CONFIRMED, "success");
      refetchEarnedRewards();
      setSelectedNFTs([]);
      setTxHashes((prev) => ({ ...prev, claim: undefined }));
      setShowGlobalLoader(false);
    } else if (txHashes.claim && !isClaiming && !isClaimConfirmed) {
      showToast(TOAST_MESSAGES.CLAIM_FAILED("Transaction failed or rejected."), "error");
      setTxHashes((prev) => ({ ...prev, claim: undefined }));
      setShowGlobalLoader(false);
    }
    prevIsClaiming.current = isClaiming;

    if (!isAnyTxActive && showGlobalLoader && !isWritePending) {
      setShowGlobalLoader(false);
    }

  }, [
    isApproving, isApproveConfirmed, txHashes.approve, refetchApproval,
    isStaking, isStakeConfirmed, txHashes.stake, refetchStakedTokenIds, refetchEarnedRewards, setSelectedNFTs, fetchLeaderboardData, // Added fetchLeaderboardData
    isUnstaking, isUnstakeConfirmed, txHashes.unstake,
    isClaiming, isClaimConfirmed, txHashes.claim,
    showToast, setShowGlobalLoader, setLoaderMessage, isAnyTxActive, isWritePending
  ]);


  // --- Approval handler ---
  const handleApprove = useCallback(() => {
    if (!address) {
      showToast(TOAST_MESSAGES.CONNECT_WALLET, "error");
      return;
    }

    writeContract(
      {
        address: HerbivoresAddress,
        abi: HerbivoresABI,
        functionName: "setApprovalForAll",
        args: [StakeNFTAddress, true],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, approve: hash }));
          showToast(TOAST_MESSAGES.TX_SUBMITTED, "info");
        },
        onError: (error) => {
          showToast(error.message || TOAST_MESSAGES.APPROVAL_FAILED(""), "error");
        },
      }
    );
  }, [address, writeContract, showToast]);

  // --- Stake handler ---
  const handleStake = useCallback(() => {
    if (!address) {
      showToast(TOAST_MESSAGES.CONNECT_WALLET, "error");
      return;
    }

    if (!selectedNFTs.length) {
      showToast(TOAST_MESSAGES.NO_NFT_SELECTED, "warning");
      return;
    }

    writeContract(
      {
        address: StakeNFTAddress,
        abi: StakeNFTABI,
        functionName: "stake",
        args: [HerbivoresAddress, selectedNFTs.map(BigInt)],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, stake: hash }));
          showToast(TOAST_MESSAGES.TX_SUBMITTED, "info");
        },
        onError: (error) => {
          showToast(error.message || TOAST_MESSAGES.STAKE_FAILED(""), "error");
        },
      }
    );
  }, [address, writeContract, selectedNFTs, showToast]);

  // --- Unstake handler ---
  const handleUnstake = useCallback(() => {
    if (!address) {
      showToast(TOAST_MESSAGES.CONNECT_WALLET, "error");
      return;
    }

    if (!selectedNFTs.length) {
      showToast(TOAST_MESSAGES.NO_NFT_SELECTED, "warning");
      return;
    }

    writeContract(
      {
        address: StakeNFTAddress,
        abi: StakeNFTABI,
        functionName: "unstake",
        args: [HerbivoresAddress, selectedNFTs.map(BigInt)],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, unstake: hash }));
          showToast(TOAST_MESSAGES.TX_SUBMITTED, "info");
        },
        onError: (error) => {
          showToast(error.message || TOAST_MESSAGES.UNSTAKE_FAILED(""), "error");
        },
      }
    );
  }, [address, writeContract, selectedNFTs, showToast]);

  // --- Claim handler ---
  const handleClaim = useCallback(() => {
    if (!address) {
      showToast(TOAST_MESSAGES.CONNECT_WALLET, "error");
      return;
    }

    if (!selectedNFTs.length) {
      showToast(TOAST_MESSAGES.NO_NFT_SELECTED, "warning");
      return;
    }

    writeContract(
      {
        address: StakeNFTAddress,
        abi: StakeNFTABI,
        functionName: "claim",
        args: [HerbivoresAddress, selectedNFTs.map(BigInt)],
      },
      {
        onSuccess: (hash) => {
          setTxHashes((prev) => ({ ...prev, claim: hash }));
          showToast(TOAST_MESSAGES.TX_SUBMITTED, "info");
          setSelectedNFTs([]);
        },
        onError: (error) => {
          showToast(error.message || TOAST_MESSAGES.CLAIM_FAILED(""), "error");
        },
      }
    );
  }, [address, writeContract, selectedNFTs, showToast]);


  // --- Filter & sort ---
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

  const isLoading =
    activeTab === "owned"
      ? loadingOwned
      : loadingStakedTokenIds || loadingEarnedRewards;

  return (
    <>
      {/* --- Global Loading Overlay --- */}
      {showGlobalLoader && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col items-center justify-center text-white text-lg">
          <Loader className="w-12 h-12 text-teal-400 animate-spin mb-4" />
          <p>{loaderMessage}</p>
          <p className="text-sm text-gray-300 mt-2">Please wait, this might take a moment.</p>
        </div>
      )}

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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 p-5  max-h-[600px] sm:max-h-[700px] overflow-y-auto">
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
              {activeTab === "owned" && (
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    {isApproved ? "Stake Options" : "Approve Collection"}
                  </span>
                  {isApproved ? (
                    <>
                      <span className="text-3xl font-bold text-gray-900 mt-2">
                        {selectedNFTs.length} NFT{selectedNFTs.length !== 1 && 's'}
                      </span>
                      <button
                        onClick={handleStake}
                        disabled={!selectedNFTs.length || isAnyTxActive || isWritePending}
                        className="mt-4 bg-teal-500 text-white rounded-full px-8 py-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isStaking || (isWritePending && txHashes.stake) ? <Loader className="w-5 h-5 animate-spin" /> : 'Stake'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleApprove}
                      className="mt-4 bg-teal-500 text-white rounded-full px-8 py-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isAnyTxActive || isWritePending}
                    >
                      {isApproving || (isWritePending && txHashes.approve) ? <Loader className="w-5 h-5 animate-spin" /> : 'Approve'}
                    </button>
                  )}
                </div>
              )}

              {activeTab === "staked" && (
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between items-center">
                  <span className="text-gray-500 text-sm">Unstake Options</span>
                  <span className="text-3xl font-bold text-gray-900 mt-2">
                    {selectedNFTs.length} NFT{selectedNFTs.length !== 1 && 's'}
                  </span>
                  <button
                    onClick={handleUnstake}
                    disabled={!selectedNFTs.length || isAnyTxActive || isWritePending}
                    className="mt-4 bg-teal-500 text-white rounded-full px-8 py-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUnstaking || (isWritePending && txHashes.unstake) ? <Loader className="w-5 h-5 animate-spin" /> : 'Unstake'}
                  </button>
                </div>
              )}


              <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Total Pending Rewards</span>
                  <span className="text-3xl font-bold text-gray-900 mt-2">
                    {totalPendingRewards} CTEA
                  </span>
                </div>
                <button
                  onClick={handleClaim}
                  disabled={!selectedNFTs.length || isAnyTxActive || isWritePending}
                  className="mt-4 bg-teal-500 text-white rounded-full px-8 py-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClaiming || (isWritePending && txHashes.claim) ? <Loader className="w-5 h-5 animate-spin" /> : 'Claim'}
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <LeaderboardSticky
            leaderboard={leaderboardData} // Gunakan data leaderboard yang di-fetch
            currentAddress={address || 'You'}
            isLoading={isLoadingLeaderboard} // Kirim state loading
            error={errorLeaderboard} // Kirim state error
          />
        </div>
      </div>
    </>
  );
};

export default StakePage;