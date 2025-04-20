'use client';

import {
  CubeTransparentIcon,
  PhotoIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { METADATA_TRAITS } from "@/constants/metadata";
import { useToast } from "@/context/ToastContext";
import { PinataSDK } from "pinata";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { mintNFTABI, mintNFTAddress } from "@/constants/ContractAbi";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

type TraitType = keyof typeof METADATA_TRAITS;
type SelectedTraits = Record<TraitType, string>;

const LAYER_ORDER: TraitType[] = [
  "Background",
  "Speciality",
  "Skin",
  "Clothes",
  "Beard",
  "Head",
  "Eyes",
  "Mustache",
  "Nose",
  "Coin",
  "Hands",
];

const getOrderedTraits = () =>
  LAYER_ORDER.filter((trait) => trait in METADATA_TRAITS) as TraitType[];

export default function GenerateImagePage() {
  const traits = getOrderedTraits();
  const { showToast } = useToast();
  const { isConnected, address } = useAccount();
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [activeTrait, setActiveTrait] = useState<TraitType>("Background");
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>(
    traits.reduce((acc, trait) => ({ ...acc, [trait]: "" }), {} as SelectedTraits)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState(false);

  const { data: balance } = useBalance({ address });
  const {
    data: txHash,
    error: txError,
    isPending: isMintPending,
    writeContract,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const { data: maxSupply } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "MAX_SUPPLY",
  });
  const { data: totalSupply } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "totalSupply",
  });
  const { data: mintedCount } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "balanceOf",
  });

  useEffect(() => {
    return () => {
      if (pendingFiles.length) {
        pinata.files.public.delete(pendingFiles);
        setPendingFiles([]);
      }
    };
  }, [pendingFiles]);

  const handleRandomize = useCallback(async () => {
    setIsRandomizing(true);
    await new Promise((r) => setTimeout(r, 50));
    const randomTraits = traits.reduce((acc, trait) => {
      const opts = METADATA_TRAITS[trait];
      return { ...acc, [trait]: opts[Math.floor(Math.random() * opts.length)] || "" };
    }, {} as SelectedTraits);
    setSelectedTraits(randomTraits);
    setIsRandomizing(false);
  }, [traits]);

  const handleSelectTrait = useCallback((asset: string) => {
    setSelectedTraits((prev) => ({
      ...prev,
      [activeTrait]: prev[activeTrait] === asset ? "" : asset,
    }));
  }, [activeTrait]);

  const composeImage = useCallback(async (sel: SelectedTraits) => {
    setIsComposing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No canvas context");
      for (const trait of LAYER_ORDER) {
        const asset = sel[trait];
        if (!asset) continue;
        await new Promise<void>((res) => {
          const img = new Image();
          img.onload = () => {
            const x = (512 - img.width) / 2;
            const y = (512 - img.height) / 2;
            ctx.drawImage(img, x, y, img.width, img.height);
            res();
          };
          img.src = `/assets/${trait}/${asset}`;
        });
      }
      return canvas.toDataURL("image/webp", 0.9);
    } finally {
      setIsComposing(false);
    }
  }, []);

  const handleMint = useCallback(async () => {
    if (!isConnected || !address) {
      showToast("Please connect wallet first", "error");
      return;
    }
    if ((balance?.value ?? BigInt(0)) < parseEther("2")) {
      showToast("Insufficient balance", "error");
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await composeImage(selectedTraits);
      const blob = await (await fetch(dataUrl)).blob();
      const ts = Date.now();
      const prefix = address
        ? `${address.slice(2, 6)}_${address.slice(-4)}`
        : "anon";
      const imgName = `EE_${prefix}_${ts}_img.webp`;
      const imageFile = new File([blob], imgName, { type: "image/webp" });
      const imageRes = await pinata.upload.public.file(imageFile);
      setPendingFiles((p) => [...p, imageRes.id]);

      const metadata = {
        name: "Ethereal Entity",
        description: "Unique digital collectible",
        image: `ipfs://${imageRes.cid}`,
        attributes: LAYER_ORDER.map((t) => ({
          trait_type: t,
          value: selectedTraits[t] || "None",
        })),
      };
      const metaName = `EE_${prefix}_${ts}_meta.json`;
      const metaFile = new File([JSON.stringify(metadata)], metaName, {
        type: "application/json",
      });
      const metaRes = await pinata.upload.public.file(metaFile);
      setPendingFiles((p) => [...p, metaRes.id]);

      writeContract({
        address: mintNFTAddress,
        abi: mintNFTABI,
        functionName: "mint",
        args: [BigInt(1), `ipfs://${metaRes.cid}`],
        value: parseEther("2"),
      });
    } catch (e) {
      console.error(e);
      showToast("Minting failed", "error");
    } finally {
      setIsUploading(false);
    }
  }, [
    address,
    balance,
    composeImage,
    isConnected,
    selectedTraits,
    showToast,
    writeContract,
  ]);

  const isLoading = isUploading || isMintPending || isConfirming;
  const previewImage = useMemo(
    () =>
      LAYER_ORDER.map((t) => ({ trait: t, asset: selectedTraits[t] }))
        .filter((x) => x.asset)
        .map((x) => `/assets/${x.trait}/${x.asset}`),
    [selectedTraits]
  );

  useEffect(() => {
    if (isConfirmed) showToast("NFT minted successfully!", "success");
    if (txError) showToast("Transaction failed", "error");
  }, [isConfirmed, txError, showToast]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Ethereal Entities
          </h1>
          <p className="text-lg text-gray-600">
            by Digital Artistry
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Mint Progress</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(Number(totalSupply) /
                    Number(maxSupply || 1)) *
                    100}%`,
                }}
              />
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {totalSupply || 0}
              <span className="text-sm text-gray-500">/{maxSupply}</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Your Balance</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-800">
                {(balance?.formatted.slice(0, 7) || "0.00")} TEA
              </p>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Trait Selection & Preview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-blue-400" />
                {activeTrait} Selection
              </h3>
              <span className="text-sm text-gray-500">
                {METADATA_TRAITS[activeTrait].length} options
              </span>
            </div>

            {/* Trait Tabs */}
            <div className="hidden md:flex flex-wrap gap-2 mb-6">
              {traits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => setActiveTrait(trait)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTrait === trait
                    ? "bg-blue-400 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {trait}
                </button>
              ))}
            </div>

            <div className="md:hidden mb-6">
              <select
                value={activeTrait}
                onChange={(e) =>
                  setActiveTrait(e.target.value as TraitType)
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-200"
              >
                {traits.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Trait Options */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {METADATA_TRAITS[activeTrait].map((asset) => (
                <button
                  key={asset}
                  onClick={() => handleSelectTrait(asset)}
                  className={`relative aspect-square rounded-xl border-2 transition ${selectedTraits[activeTrait] === asset
                    ? "border-blue-400 scale-105 shadow ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <img
                    src={`/assets/${activeTrait}/${asset}`}
                    alt={asset}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {selectedTraits[activeTrait] === asset && (
                    <div className="absolute top-1 right-1 bg-blue-400 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview & Attributes */}
          <div className="sticky top-6 bg-white rounded-xl shadow p-6">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative mb-4">
              {isComposing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 animate-pulse">
                  <ArrowPathIcon className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-gray-500 text-sm">Assembling your NFT...</p>
                </div>
              ) : previewImage.length ? (
                previewImage.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="NFT Preview"
                    className="absolute inset-0 w-full h-full object-contain p-4"
                    style={{ zIndex: i }}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <SparklesIcon className="w-16 h-16 text-blue-200" />
                  <p className="text-gray-400 font-medium">
                    Select traits to begin crafting
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {LAYER_ORDER.map((t) =>
                selectedTraits[t] ? (
                  <div
                    key={t}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <span className="text-gray-600">{t}</span>
                    <span className="text-blue-600 font-medium truncate max-w-[120px]">
                      {selectedTraits[t]}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white rounded-xl shadow p-4 flex gap-4">
            <button
              onClick={handleRandomize}
              disabled={isRandomizing}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${isRandomizing
                ? "bg-gray-200 cursor-not-allowed text-gray-400"
                : "bg-white hover:bg-gray-50 text-gray-600"
                }`}
            >
              {isRandomizing ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-400" />
              ) : (
                <CubeTransparentIcon className="w-5 h-5 text-blue-400" />
              )}
              <span className="font-medium">
                {isRandomizing ? "Randomizing..." : "Randomize"}
              </span>
            </button>

            <button
              onClick={handleMint}
              disabled={!isConnected || isLoading || !previewImage.length}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition ${isLoading
                ? "bg-blue-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-400 to-purple-400 hover:shadow-lg"
                }`}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </div>
              )}
              <div className="relative flex items-center gap-2 text-white">
                <SparklesIcon className="w-6 h-6 text-amber-200" />
                <div className="text-left">
                  <p className="text-lg font-semibold">Mint Now</p>
                  <p className="text-xs font-medium">
                    {mintedCount?.toString() || 0}/20 remaining • 2 TEA each
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
