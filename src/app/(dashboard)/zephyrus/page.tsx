"use client";

import { useEffect, useRef } from "react";
import { BaseError, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { ZephyrusAddress, ZephyrusABI } from "@/constants/ZephyrusAbi";
import { useToast } from "@/context/ToastContext";
import { useAccount, useBalance } from "wagmi";
import { SparklesIcon, CurrencyDollarIcon, UsersIcon, FireIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const ZephyrusPage = () => {
  const { showToast } = useToast();
  const { address } = useAccount();
  const mintAmount = 1; // Lock mint amount to 1

  // Contract Reads
  const { data: totalSupply } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "totalSupply"
  });

  const { data: maxSupply } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "MAX_SUPPLY"
  });

  const { data: mintPrice, isLoading: isLoadingPrice } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "mintPrice"
  });

  const { data: maxPerTx } = useReadContract({
    address: ZephyrusAddress,
    abi: ZephyrusABI,
    functionName: "MAX_PER_TX"
  });

  // Wallet Balance
  const { data: balance } = useBalance({ address });

  // Mint Transaction
  const {
    data: hash,
    error,
    isPending,
    writeContract
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  });

  // State Tracking
  const prevIsConfirming = useRef(false);
  const prevIsConfirmed = useRef(false);
  const prevError = useRef<BaseError | null>(null);

  useEffect(() => {
    if (isConfirming && !prevIsConfirming.current) {
      showToast("Transaction is being confirmed...", "info");
    }
    prevIsConfirming.current = isConfirming;

    if (isConfirmed && !prevIsConfirmed.current) {
      showToast("NFT Minted Successfully!", "success");
    }
    prevIsConfirmed.current = isConfirmed;

    if (error && error !== prevError.current) {
      const errorMsg = error instanceof BaseError
        ? error.shortMessage || error.message
        : "Transaction Failed";
      showToast(errorMsg, "error");
      prevError.current = error instanceof BaseError ? error : null;
    }
  }, [isConfirming, isConfirmed, error, showToast]);

  const handleMint = () => {
    if (!address) {
      showToast("Please connect wallet", "error");
      return;
    }

    if (!mintPrice) {
      showToast("Mint price not available", "error");
      return;
    }

    const price = mintPrice * BigInt(mintAmount);
    const balanceValue = balance?.value || BigInt(0);

    if (balanceValue < price) {
      showToast("Insufficient balance", "error");
      return;
    }

    writeContract({
      address: ZephyrusAddress,
      abi: ZephyrusABI,
      functionName: "mint",
      args: ["ipfs://metadata"], // Ganti dengan URI metadata sebenarnya
      value: price
    });
  };

  // Progress Calculation
  const progress = Number(totalSupply || 0) / Number(maxSupply || 1) * 100;
  const totalCost = mintPrice ? mintPrice * BigInt(mintAmount) : BigInt(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden transition-transform duration-500 hover:scale-[1.005]">
        {/* Header */}
        <div className="p-8 text-center relative overflow-hidden">
          <div className="relative inline-block animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse-slow" />
            <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Ethereal Zephyrus
              <span className="block mt-2 text-xl text-purple-400 font-normal">
                Collect Unique Digital Entities
              </span>
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left Panel */}
          <div className="space-y-8">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-purple-400/20 bg-gradient-to-br from-purple-50 to-pink-50">
              <Image
                src="/assets/rabbits.png"
                alt="NFT Preview"
                fill
                className="object-cover animate-fade-in"
              />

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-purple-900/30 to-transparent">
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full">
                  <div
                    className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="flex justify-between text-sm text-purple-600 mt-1">
                    <span>{Number(totalSupply || 0)} Minted</span>
                    <span>{Number(maxSupply || 0)} Total</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Perks Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-400/20">
                <UsersIcon className="w-8 h-8 text-pink-500 mb-2" />
                <h3 className="font-semibold text-purple-600">Exclusive Access</h3>
                <p className="text-sm text-purple-500/80">Private community benefits</p>
              </div>
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-400/20">
                <FireIcon className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-purple-600">Dynamic Traits</h3>
                <p className="text-sm text-purple-500/80">Evolving NFT features</p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-8">
            {/* Price Card */}
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-purple-400/20 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">Price per NFT</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {isLoadingPrice ? (
                        <span className="text-lg">Loading...</span>
                      ) : (
                        `${formatEther(totalCost)} TEA`
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-pink-600">Your Balance</p>
                  <p className="text-2xl font-bold text-pink-800">
                    {balance?.formatted.slice(0, 6)} TEA
                  </p>
                </div>
              </div>


            </div>

            {/* Mint Button */}
            <button
              onClick={handleMint}
              disabled={isPending || !address || isLoadingPrice}
              className={`w-full flex items-center justify-center gap-3 px-8 py-5
                bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xl font-semibold
                rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300 ${isPending ? "opacity-80 cursor-not-allowed" : ""}`}
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6 text-amber-200" />
                  Mint
                </>
              )}
            </button>

            {/* Transaction Info */}
            {hash && (
              <div className="animate-fade-in text-center">
                <a
                  href={`https://sepolia.tea.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-500 transition-colors"
                >
                  <span className="underline">View Transaction</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-400/20">
                <div className="text-2xl font-bold text-purple-600">
                  {Number(maxSupply || 0)}
                </div>
                <div className="text-sm text-purple-500/80">Total Supply</div>
              </div>
              <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-400/20">
                <div className="text-2xl font-bold text-purple-600">
                  {Number(maxPerTx || 0)}
                </div>
                <div className="text-sm text-purple-500/80">Max per TX</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZephyrusPage;