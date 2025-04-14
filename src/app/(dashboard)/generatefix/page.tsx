"use client";

import {
  CubeTransparentIcon,
  PhotoIcon,
  SparklesIcon,
  CurrencyDollarIcon, ArrowPathIcon
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

const getOrderedTraits = () => {
  return LAYER_ORDER.filter((trait) => trait in METADATA_TRAITS) as TraitType[];
};

const GenerateImagePage = () => {
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
    const cleanup = async () => {
      if (pendingFiles.length > 0) {
        await pinata.files.public.delete(pendingFiles);
        setPendingFiles([]);
      }
    };
    return () => { void cleanup(); };
  }, [pendingFiles]);

  const handleRandomize = useCallback(async () => {
    setIsRandomizing(true);
    // beri jeda singkat supaya spinner sempat muncul
    await new Promise((r) => setTimeout(r, 50));

    const randomTraits = traits.reduce((acc, trait) => {
      const options = METADATA_TRAITS[trait];
      return {
        ...acc,
        [trait]: options[Math.floor(Math.random() * options.length)] || "",
      };
    }, {} as SelectedTraits);

    setSelectedTraits(randomTraits);
    setIsRandomizing(false);
  }, [traits]);

  const handleSelectTrait = useCallback((trait: string) => {
    setSelectedTraits((prev) => ({
      ...prev,
      [activeTrait]: prev[activeTrait] === trait ? "" : trait,
    }));
  }, [activeTrait]);

  const composeImage = useCallback(async (selectedTraits: SelectedTraits) => {
    setIsComposing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      for (const trait of LAYER_ORDER) {
        const asset = selectedTraits[trait];
        if (!asset) continue;
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const x = (canvas.width - img.width) / 2;
            const y = (canvas.height - img.height) / 2;
            ctx.drawImage(img, x, y, img.width, img.height);
            resolve();
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
      const blob = await fetch(dataUrl).then((r) => r.blob());

      const timestamp = Date.now();
      const addressPrefix = address ? `${address.slice(2, 6)}_${address.slice(-4)}` : "anonymous";
      const imageFilename = `EE_${addressPrefix}_${timestamp}_image.webp`;

      const imageFile = new File([blob], imageFilename, { type: "image/webp" });
      const imageRes = await pinata.upload.public.file(imageFile);
      setPendingFiles((prev) => [...prev, imageRes.id]);

      const metadata = {
        name: "Ethereal Entity",
        description: "Unique digital collectible",
        image: `ipfs://${imageRes.cid}`,
        attributes: LAYER_ORDER.map((trait) => ({
          trait_type: trait,
          value: selectedTraits[trait] || "None",
        })),
      };

      const metadataFilename = `EE_${addressPrefix}_${timestamp}_metadata.json`;
      const metadataFile = new File([JSON.stringify(metadata)], metadataFilename, {
        type: "application/json",
      });

      const metadataRes = await pinata.upload.public.file(metadataFile);
      setPendingFiles((prev) => [...prev, metadataRes.id]);

      writeContract({
        address: mintNFTAddress,
        abi: mintNFTABI,
        functionName: "mint",
        args: [BigInt(1), `ipfs://${metadataRes.cid}`],
        value: parseEther("2"),
      });
    } catch (error) {
      showToast("Minting failed", "error");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }, [address, balance, composeImage, isConnected, selectedTraits, showToast, writeContract]);

  const isLoading = isUploading || isMintPending || isConfirming;
  const previewImage = useMemo(() =>
    LAYER_ORDER.map((trait) => ({
      trait,
      asset: selectedTraits[trait],
    }))
      .filter(({ asset }) => asset)
      .map(({ trait, asset }) => `/assets/${trait}/${asset}`),
    [selectedTraits]);

  useEffect(() => {
    if (isConfirmed) showToast("NFT minted successfully!", "success");
    if (txError) showToast("Transaction failed", "error");
  }, [isConfirmed, txError, showToast]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <header className="text-center mb-16 space-y-6">
          <div className="relative inline-block animate-float">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse-slow" />
            <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              Ethereal Entities
              <span className="block mt-2 text-xl text-purple-400 font-normal">
                by Digital Artistry
              </span>
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mint Progress</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(Number(totalSupply) / Number(maxSupply)) * 100}%` }}
                  />
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {totalSupply || 0}
                  <span className="text-sm text-gray-500">/{maxSupply} minted</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Your Balance</p>
                <p className="text-3xl font-bold text-gray-800">
                  {balance?.formatted.slice(0, 7) || "0.00"} TEA
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-purple-500" />
                {activeTrait} Selection
                <span className="text-sm text-gray-400 ml-auto">
                  {METADATA_TRAITS[activeTrait].length} options
                </span>
              </h3>
            </div>

            <div className="hidden md:flex flex-wrap justify-center gap-2 mb-6">
              {traits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => setActiveTrait(trait)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeTrait === trait
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
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
                onChange={(e) => setActiveTrait(e.target.value as TraitType)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-200"
              >
                {traits.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {METADATA_TRAITS[activeTrait].map((asset) => (
                <button
                  key={asset}
                  onClick={() => handleSelectTrait(asset)}
                  className={`group relative aspect-square rounded-xl border-2 transition-all duration-300 ${selectedTraits[activeTrait] === asset
                    ? 'border-purple-500 scale-105 shadow-lg ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-purple-300'
                    }`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl" />
                  <img
                    src={`/assets/${activeTrait}/${asset}`}
                    className="w-full h-full object-cover transform rounded-xl transition-transform duration-300 group-hover:scale-110"
                    alt={asset}
                  />
                  {selectedTraits[activeTrait] === asset && (
                    <div className="absolute top-1 right-1 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="sticky top-6 h-fit bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-gray-100 overflow-hidden relative">
              {isComposing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 animate-pulse">
                  <ArrowPathIcon className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-gray-500 text-sm font-medium">
                    Assembling your NFT...
                  </p>
                  <div className="flex space-x-2">
                    {LAYER_ORDER.map((trait, i) => (
                      <div
                        key={trait}
                        className="h-1 w-1 bg-purple-300 rounded-full"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : previewImage.length > 0 ? (
                <>
                  {previewImage.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="absolute inset-0 w-full h-full object-contain p-4 animate-fade-in"
                      style={{ zIndex: i }}
                      alt="NFT Preview"
                    />
                  ))}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 animate-pulse-slow">
                    <SparklesIcon className="w-16 h-16 text-purple-200 mx-auto" />
                    <p className="text-gray-400 font-medium">
                      Select traits to begin crafting
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {LAYER_ORDER.map((trait) => (
                selectedTraits[trait] && (
                  <div
                    key={trait}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <span className="text-gray-600">{trait}</span>
                    <span className="text-purple-600 font-medium truncate max-w-[120px]">
                      {selectedTraits[trait]}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl flex gap-4">
            <button
              onClick={handleRandomize}
              disabled={isRandomizing}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 shadow-sm
              ${isRandomizing
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50 text-gray-600 hover:shadow-md"
                }`}
            >
              {isRandomizing ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin text-purple-600" />
              ) : (
                <CubeTransparentIcon className="w-5 h-5 text-purple-600" />
              )}
              <span className="font-medium">
                {isRandomizing ? "Randomizing..." : "Randomize"}
              </span>
            </button>

            <button
              onClick={handleMint}
              disabled={!isConnected || isLoading || !previewImage.length}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${isLoading
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:scale-[1.02]'
                } relative overflow-hidden`}
            >
              {!isLoading && (
                <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-300 bg-white" />
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </div>
              )}

              <div className="relative flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-amber-200" />
                <div className="text-left">
                  <p className="text-lg font-semibold text-white">Mint Now</p>
                  <p className="text-xs text-purple-100 font-medium">
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
};

export default GenerateImagePage;