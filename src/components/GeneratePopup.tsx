// src/components/GeneratePopup.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    BaseError,
    useAccount,
    useBalance,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { Images, Loader, Shuffle, Sparkles, } from "lucide-react";

import { PinataSDK } from "pinata";
import { useToast } from "@/context/ToastContext";
import {

    GenericTraitType,
    SelectedGenericTraits,
    GeneratePopupProps,
} from "@/types";

import LoadingSpinner from "@/components/LoadingSekleton";

// =================================================================
// NOTE PENTING:
// Pinata JWT harus disimpan di sisi server (misal: di API Route Next.js).
// Mengekspos JWT di client-side adalah risiko keamanan yang serius.
// Untuk tujuan demonstrasi dan perbaikan, JWT tetap di sini,
// TAPI HARAP PINDAHKAN KE BACKEND SESUAI BEST PRACTICE KEAMANAN!

// Grup ID : bd0659fa-ff67-4894-97e1-e103f1351a47
// API Key: 4a02550876e9407b06b0
// API Secret: a498f261d782dbdce69aedfe04dae2ae34a43d6f2c5c05c8472e2f5265c077e8
// JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmVsZWRpOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoiY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0YTAyNTUwODc2ZTk0MDdiMDZiMCIsInNjb3BlZEtleVNlY3JldCI6ImE0OThmMjYxZDc4MmRiZGNlNjlhZWRmZTA0ZGFlMmFlMzRhNDNkNmYyYzVjMDVjODQ3MmUyZjUyNjVjMDc3ZTgiLCJleHAiOjE3Nzk5OTg2MjF9.xgmNyop5UEbZgpuMhIOLqg2rCHvT-JnkRU0SN_1ulDE
// =================================================================
const pinata = new PinataSDK({
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0YTAyNTUwODc2ZTk0MDdiMDZiMCIsInNjb3BlZEtleVNlY3JldCI6ImE0OThmMjYxZDc4MmRiZGNlNjlhZWRmZTA0ZGFlMmFlMzRhNDNkNmYyYzVjMDVjODQ3MmUyZjUyNjVjMDc3ZTgiLCJleHAiOjE3Nzk5OTg2MjF9.xgmNyop5UEbZgpuMhIOLqg2rCHvT-JnkRU0SN_1ulDE",
    pinataGateway: "red-equivalent-hawk-791.mypinata.cloud",
});


// *** KONSTAN UNTUK PESAN TOAST ***
const TOAST_MESSAGES = {
    CONNECT_WALLET: "Please connect your wallet first.",
    INSUFFICIENT_BALANCE: "Insufficient balance to mint this NFT.",
    MAX_SUPPLY_REACHED: "Max supply reached for this collection.",
    MISSING_TRAITS: (missing: string[]) => `Please select: ${missing.map(m => m.toLowerCase()).join(", ")} for your NFT.`,
    UPLOADING_IMAGE: "Uploading NFT image to IPFS...",
    UPLOADING_METADATA: "Uploading NFT metadata to IPFS...",
    MINTING: "Initiating minting transaction...",
    MINT_SUCCESS: "NFT Minted Successfully! Check your wallet. 🥳",
    MINT_FAILED: "Minting failed. Please try again.",
    CONFIRMING_TX: "Confirming transaction on blockchain...",
    TX_FAILED: (msg: string) => `Transaction failed: ${msg}`,
    GENERIC_ERROR: "An unexpected error occurred. Please try again.",
    PINATA_UPLOAD_ERROR: (type: 'image' | 'metadata') => `Failed to upload ${type} to IPFS.`,
    PINATA_DELETE_ERROR: (type: 'image' | 'metadata') => `Failed to delete orphaned ${type} from Pinata.`,
};

export default function GeneratePopup({ slide, onClose }: GeneratePopupProps) {
    const {
        assetFolder: folder,
        name: collectionName,
        price,
        contractAddress,
        contractABI,
        metadataTraits,
        layerOrder,
        PinataGrup
    } = slide;

    const traits = useMemo(
        () =>
            (layerOrder as GenericTraitType[]).filter(
                (t) => metadataTraits && t in metadataTraits
            ) as GenericTraitType[],
        [layerOrder, metadataTraits]
    );



    const { addToast } = useToast();
    const { isConnected, address } = useAccount();

    // State lokal
    const [activeTrait, setActiveTrait] = useState<GenericTraitType>(traits[0] || "");
    const [selectedTraits, setSelectedTraits] = useState<SelectedGenericTraits>(
        traits.reduce((acc, t) => ({ ...acc, [t]: "" }), {} as SelectedGenericTraits)
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isRandomizing, setIsRandomizing] = useState(false);
    const [currentLoaderMessage, setCurrentLoaderMessage] = useState("");
    // New state to store Pinata file IDs for cleanup
    const [imageFileId, setImageFileId] = useState<string | null>(null);
    const [metadataFileId, setMetadataFileId] = useState<string | null>(null);

    // Ref untuk melacak status transaksi sebelumnya (untuk menghindari duplikat toast)
    const prevIsConfirming = useRef(false);
    const prevIsConfirmed = useRef(false);
    const prevTxError = useRef<BaseError | Error | null>(null);

    // Cache gambar yang sudah dimuat untuk optimasi
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

    // Wagmi hooks untuk interaksi dengan smart contract
    const { data: balance } = useBalance({ address });
    const { data: maxSupply } = useReadContract({
        address: contractAddress,
        abi: contractABI ?? [],
        functionName: "MAX_SUPPLY",
    });
    const { data: totalSupply } = useReadContract({
        address: contractAddress,
        abi: contractABI ?? [],
        functionName: "totalSupply",
    });

    const {
        data: txHash,
        error: txError,
        isPending,
        writeContract,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash: txHash });

    // State turunan untuk indikator komposisi & minting
    const isGeneratingPreview = isRandomizing;
    const isMintingProcess = isPending || isConfirming || isUploading;

    // Fungsi untuk mengacak trait
    const handleRandomize = useCallback(() => {
        setIsRandomizing(true);
        const randomTraits = traits.reduce((acc, t) => {
            const options = metadataTraits?.[t];
            if (options && options.length > 0) {
                return {
                    ...acc,
                    [t]: options[Math.floor(Math.random() * options.length)],
                };
            }
            return acc;
        }, {} as SelectedGenericTraits);

        setTimeout(() => {
            setSelectedTraits(randomTraits);
            setIsRandomizing(false);
        }, 500);
    }, [traits]);

    // Fungsi untuk memilih trait
    const handleSelectTrait = useCallback(
        (asset: string) => {
            setSelectedTraits((prev) => ({
                ...prev,
                [activeTrait]: prev[activeTrait] === asset ? "" : asset,
            }));
        },
        [activeTrait]
    );

    // Fungsi untuk menyusun gambar dari lapisan dengan caching
    const composeImage = useCallback(
        async (traitsMap: SelectedGenericTraits): Promise<string> => {
            const canvas = document.createElement("canvas");
            const size = 520;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Canvas context not available");
            }

            if (!traitsMap["Background"]) {
                ctx.fillStyle = "#F0F0F0";
                ctx.fillRect(0, 0, size, size);
            }

            for (const t of layerOrder ?? []) {
                const asset = traitsMap[t];
                if (!asset) continue;

                const imagePath = `/assets/${folder}/${t}/${asset}`;
                let img = imageCache.current.get(imagePath);

                if (!img) {
                    img = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const newImg = new Image();
                        newImg.onload = () => {
                            imageCache.current.set(imagePath, newImg);
                            resolve(newImg);
                        };
                        newImg.onerror = () => {
                            console.warn(`Failed to load image: ${imagePath}`);
                            reject(new Error(`Failed to load image: ${imagePath}`));
                        };
                        newImg.src = imagePath;
                    });
                }
                ctx.drawImage(img, 0, 0, size, size);
            }

            return canvas.toDataURL("image/webp", 0.9);
        },
        [folder]
    );

    // Fungsi untuk menghapus file dari Pinata
    const deletePinataFiles = useCallback(async (imgId: string | null, metaId: string | null) => {
        if (imgId) {
            try {
                await pinata.groups.public.removeFiles({
                    groupId: PinataGrup,
                    files: imgId ? [imgId] : []
                });
                console.log(`Successfully deleted image file from Pinata: ${imgId}`);
            } catch (deleteError) {
                console.error(`Failed to delete image file ${imgId} from Pinata:`, deleteError);
                addToast({ message: TOAST_MESSAGES.PINATA_DELETE_ERROR('image'), type: "warning" });
            }
        }
        if (metaId) {
            try {
                await pinata.groups.public.removeFiles({
                    groupId: PinataGrup,
                    files: metaId ? [metaId] : []
                });
                console.log(`Successfully deleted metadata file from Pinata: ${metaId}`);
            } catch (deleteError) {
                console.error(`Failed to delete metadata file ${metaId} from Pinata:`, deleteError);
                addToast({ message: TOAST_MESSAGES.PINATA_DELETE_ERROR('metadata'), type: "warning" });
            }
        }
        // Reset file IDs after attempting deletion
        setImageFileId(null);
        setMetadataFileId(null);
    }, [addToast]);


    // Logika minting
    const handleMint = useCallback(async () => {
        // Validasi awal
        if (!isConnected || !address) {
            return addToast({ message: TOAST_MESSAGES.CONNECT_WALLET, type: "error" });
        }

        if ((balance?.value ?? BigInt(0)) < parseEther(price)) {
            return addToast({ message: TOAST_MESSAGES.INSUFFICIENT_BALANCE, type: "error" });
        }

        if (
            totalSupply !== undefined && totalSupply !== null &&
            maxSupply !== undefined && maxSupply !== null &&
            totalSupply >= maxSupply
        ) {
            return addToast({ message: TOAST_MESSAGES.MAX_SUPPLY_REACHED, type: "error" });
        }

        const missingTraits = traits.filter((t) => !selectedTraits[t]);
        if (missingTraits.length) {
            return addToast({ message: TOAST_MESSAGES.MISSING_TRAITS(missingTraits), type: "error" });
        }

        // --- Proses Minting Dimulai ---
        setCurrentLoaderMessage("Preparing your NFT...");
        setIsUploading(true);

        // Reset file IDs at the beginning of a new mint attempt
        setImageFileId(null);
        setMetadataFileId(null);

        let currentImageFileId: string | null = null;
        let currentMetadataFileId: string | null = null;

        try {
            // 1. Upload Image to IPFS
            addToast({ message: TOAST_MESSAGES.UPLOADING_IMAGE, type: "info" });
            setCurrentLoaderMessage(TOAST_MESSAGES.UPLOADING_IMAGE);

            const dataUrl = await composeImage(selectedTraits);
            const blob = await fetch(dataUrl).then((r) => r.blob());
            const ts = Date.now();
            const prefix = address ? `${address.slice(2, 6)}_${address.slice(-4)}` : "anon";
            const imageName = `${collectionName}_${prefix}_${ts}_img.webp`;
            const imageFile = new File([blob], imageName, { type: "image/webp", lastModified: ts });

            let imgRes;
            try {
                // *** MODIFIKASI INI: Tambahkan .group() saat mengunggah gambar ***
                imgRes = await pinata.upload.public.file(imageFile).group(PinataGrup);
                currentImageFileId = imgRes.id;
                setImageFileId(currentImageFileId); // Store ID in state
            } catch (pinataError) {
                console.error("Pinata image upload error:", pinataError);
                throw new Error(TOAST_MESSAGES.PINATA_UPLOAD_ERROR('image'));
            }

            // 2. Upload Metadata to IPFS
            addToast({ message: TOAST_MESSAGES.UPLOADING_METADATA, type: "info" });
            setCurrentLoaderMessage(TOAST_MESSAGES.UPLOADING_METADATA);

            const metadata = {
                name: collectionName,
                description: "Unique Herbivores NFT",
                image: `ipfs://${imgRes.cid}`,
                attributes: (layerOrder ?? []).map((t) => ({
                    trait_type: t,
                    value: selectedTraits[t] || "None",
                })),
                created_at: new Date().toISOString(),
            };
            const metaBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
            const metaFile = new File([metaBlob], `${collectionName}_${prefix}_${ts}_meta.json`, { type: "application/json" });

            let metaRes;
            try {
                // *** MODIFIKASI INI: Tambahkan .group() saat mengunggah metadata ***
                metaRes = await pinata.upload.public.file(metaFile).group(PinataGrup);
                currentMetadataFileId = metaRes.id;
                setMetadataFileId(currentMetadataFileId); // Store ID in state
            } catch (pinataError) {
                console.error("Pinata metadata upload error:", pinataError);
                // If metadata upload fails, try to delete the image that was already uploaded
                await deletePinataFiles(currentImageFileId, null); // Delete only the image
                throw new Error(TOAST_MESSAGES.PINATA_UPLOAD_ERROR('metadata'));
            }

            // 3. Initiate Minting Transaction
            addToast({ message: TOAST_MESSAGES.MINTING, type: "info" });
            setCurrentLoaderMessage(TOAST_MESSAGES.MINTING);

            if (!contractAddress) {
                throw new Error("Contract address is missing.");
            }
            writeContract({
                address: contractAddress,
                abi: contractABI ?? [],
                functionName: "mint",
                args: [`ipfs://${metaRes.cid}`],
                ...(price ? { value: parseEther(price) } : {}),
            });

        } catch (err) {
            console.error("Minting process error:", err);
            const errorMessage = (err instanceof Error) ? err.message : TOAST_MESSAGES.GENERIC_ERROR;
            addToast({ message: errorMessage, type: "error" });
            // Attempt to delete any files that were uploaded in this failed attempt
            // This catches errors before or during `writeContract` call
            if (currentImageFileId || currentMetadataFileId) {
                await deletePinataFiles(currentImageFileId, currentMetadataFileId);
            }
            setIsUploading(false);
            setCurrentLoaderMessage("");
        } finally {
            // Further cleanup after the entire minting process (including transaction confirmation)
            // will be handled by the useEffect for txError and isConfirmed
        }
    }, [
        isConnected,
        address,
        balance,
        totalSupply,
        maxSupply,
        selectedTraits,
        composeImage,
        writeContract,
        addToast,
        traits,
        collectionName,
        price,
        deletePinataFiles // Add deletePinataFiles to the dependency array
    ]);

    // Efek samping untuk notifikasi transaksi Wagmi dan pembersihan
    useEffect(() => {
        // Notifikasi "Confirming..."
        if (isConfirming && !prevIsConfirming.current) {
            addToast({ message: TOAST_MESSAGES.CONFIRMING_TX, type: "info" });
            setCurrentLoaderMessage(TOAST_MESSAGES.CONFIRMING_TX);
        }
        prevIsConfirming.current = isConfirming;

        // Notifikasi "Minted!"
        if (isConfirmed && !prevIsConfirmed.current) {
            addToast({ message: TOAST_MESSAGES.MINT_SUCCESS, type: "success" });
            setCurrentLoaderMessage("Minting complete!");
            // Reset file IDs after successful mint, no need to delete
            setImageFileId(null);
            setMetadataFileId(null);
            setTimeout(() => {
                onClose();
                setCurrentLoaderMessage("");
                setIsUploading(false);
            }, 1500);
        }
        prevIsConfirmed.current = isConfirmed;

        // Penanganan error transaksi Wagmi
        if (txError && txError !== prevTxError.current) {
            const errorMessage =
                txError instanceof BaseError
                    ? txError.shortMessage || txError.message
                    : TOAST_MESSAGES.GENERIC_ERROR;
            addToast({ message: TOAST_MESSAGES.TX_FAILED(errorMessage), type: "error" });
            setCurrentLoaderMessage("");
            setIsUploading(false);

            // *** IMPORTANT: Delete files from Pinata if the transaction fails on-chain ***
            if (imageFileId || metadataFileId) {
                console.warn("Transaction failed, attempting to delete files from Pinata...");
                deletePinataFiles(imageFileId, metadataFileId);
            }
        }
        prevTxError.current = txError;

        // Kapan global loader harus disembunyikan
        if (!isPending && !isConfirming && !isUploading && !txError && currentLoaderMessage) {
            setCurrentLoaderMessage("");
        }

    }, [isConfirming, isConfirmed, txError, addToast, onClose, isPending, isUploading, currentLoaderMessage, imageFileId, metadataFileId, deletePinataFiles]);


    // Status komputasi untuk menonaktifkan tombol
    const isGeneratingOrProcessing = isRandomizing || isMintingProcess;

    // URL gambar pratinjau yang disusun
    const previewImageSources = useMemo(
        () =>
            (layerOrder ?? []).filter((t) => selectedTraits[t]).map(
                (t) => `/assets/${folder}/${t}/${selectedTraits[t]}`
            ),
        [selectedTraits, folder]
    );

    // Hitung persentase supply
    const currentTotalSupply = Number(totalSupply || BigInt(0));
    const currentMaxSupply = Number(maxSupply || BigInt(1));
    const supplyProgressPercentage = (currentTotalSupply / currentMaxSupply) * 100;
    const isSupplySoldOut = currentTotalSupply >= currentMaxSupply;


    return (
        <>
            {/* *** Global Loading Overlay *** */}
            {isMintingProcess && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col items-center justify-center text-white text-lg">
                    <LoadingSpinner fullScreen={false} message={currentLoaderMessage || "Processing transaction..."} />
                    <p className="text-sm text-gray-300 mt-2">Please wait, this might take a moment.</p>
                </div>
            )}

            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4">
                <div className="rounded-lg gap-2 p-2 w-full max-w-7xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto overflow-hidden">
                    {/* Bagian Kiri: Pemilihan Trait dan Pratinjau */}
                    <div className="bg-white/40 backdrop-blur-sm flex flex-col md:flex-row rounded-lg gap-2 p-5 w-full">
                        {/* Panel Pemilihan Trait */}
                        <div className="bg-white w-full md:w-1/2 p-4 sm:p-6 rounded-xl shadow-lg flex-shrink-0 max-h-none md:max-h-full">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Images className="w-5 h-5 text-blue-400" />
                                    {activeTrait} Selection
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {metadataTraits?.[activeTrait]?.length ?? 0} options
                                </span>
                            </div>

                            {/* Tabs untuk Desktop */}
                            <div className="hidden lg:flex flex-wrap gap-2 mb-3">
                                {traits.map((trait) => (
                                    <button
                                        key={trait}
                                        onClick={() => setActiveTrait(trait)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400 ${activeTrait === trait
                                            ? "bg-teal-500 text-white shadow-md transform scale-105"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            }`}
                                    >
                                        {trait}
                                    </button>
                                ))}
                            </div>

                            {/* Dropdown untuk Mobile */}
                            <div className="block lg:hidden mb-4">
                                <select
                                    value={activeTrait}
                                    onChange={(e) => setActiveTrait(e.target.value as GenericTraitType)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-teal-200"
                                >
                                    {traits.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Grid Opsi Trait */}
                            <div className="w-full max-h-[50vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-3 mb-1">
                                {metadataTraits?.[activeTrait]?.map((asset: string) => (
                                    <button
                                        key={asset}
                                        onClick={() => handleSelectTrait(asset)}
                                        className={`relative aspect-square rounded-lg border-2 transition focus:outline-none ${selectedTraits[activeTrait] === asset
                                            ? "border-teal-500 scale-105 shadow-lg"
                                            : "border-gray-200 hover:border-teal-300"
                                            }`}
                                    >
                                        <img
                                            src={`/assets/${folder}/${activeTrait}/${asset}`}
                                            alt={`${asset} ${activeTrait.toLowerCase()} layer`}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        {selectedTraits[activeTrait] === asset && (
                                            <div className="absolute top-2 right-2 bg-teal-500 text-white p-1 rounded-full text-xs animate-bounce-in shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}

                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Panel Pratinjau Gambar dan Randomize */}
                        <div className="bg-white w-full md:w-1/2 p-4 sm:p-6 flex flex-col gap-4 rounded-xl shadow-lg flex-shrink-0 max-h-none md:max-h-full">
                            <div className="aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center">
                                {isGeneratingPreview ? (
                                    <div className="flex flex-col items-center space-y-4 text-gray-600 dark:text-gray-300 animate-pulse">
                                        <Loader className="w-12 h-12 text-teal-500 animate-spin" />
                                        <p className="text-base font-medium">Assembling your unique NFT...</p>
                                    </div>
                                ) : previewImageSources.length ? (
                                    <div className="relative w-full h-full animate-fade-in-up">
                                        {previewImageSources.map((src, i) => (
                                            <img
                                                key={i}
                                                src={src}
                                                className="absolute inset-0 w-full h-full object-contain"
                                                style={{ zIndex: i }}
                                                alt={`Preview layer ${i}`}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4 text-gray-400 dark:text-gray-500">
                                        <Sparkles className="w-16 h-16 text-teal-300 animate-pulse" />
                                        <p className="text-base text-center">Select traits or randomize to begin customizing your NFT!</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleRandomize}
                                disabled={isGeneratingOrProcessing}
                                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-300 hover:from-teal-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-teal-400 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isRandomizing ? (
                                    <>
                                        <Loader className="animate-spin mr-2" size={20} /> Randomizing...
                                    </>
                                ) : (
                                    <>
                                        <Shuffle size={20} /> Randomize
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Bagian Kanan: Checkout dan Mint */}
                    <div className="relative w-full max-w-lg sm:max-w-md md:max-w-sm bg-white/40 backdrop-blur-sm rounded-lg shadow-lg flex flex-col justify-between gap-4 p-4 sm:p-6 text-white">
                        {/* Tombol Tutup */}
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute top-3 right-3 w-6 h-6 text-white/80 hover:text-white flex items-center justify-center rounded-full transition-colors"
                        >
                            ✕
                        </button>

                        {/* Header Checkout */}
                        <div className="text-center space-y-1 pt-6">
                            <h1 className="text-lg sm:text-xl font-bold">
                                Checkout {slide.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-white/70">
                                Expand your digital collection with a tea!
                            </p>
                        </div>

                        {/* Saldo Pengguna */}
                        <div className="bg-white text-gray-900 rounded-xl px-4 py-3 shadow-inner">
                            <div className="flex flex-col items-center">
                                <span className="text-xs sm:text-sm text-gray-500">
                                    Your balance
                                </span>
                                <span className="mt-1 text-xl sm:text-2xl font-bold">
                                    {balance?.formatted.slice(0, 7) || "0.00"} $TEA
                                </span>
                            </div>
                        </div>

                        {/* Harga & Kuantitas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs sm:text-sm text-white/70">
                                    Price per item
                                </span>
                                <div className="bg-gray-600 text-center text-white rounded-xl px-2 py-1 shadow-inner mt-1">
                                    <span className="block text-lg sm:text-xl font-bold">
                                        {price} $TEA
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs sm:text-sm text-white/70">Quantity</span>
                                <div className="bg-gray-600 text-center text-white rounded-xl px-2 py-1 shadow-inner mt-1">
                                    <span className="block text-lg sm:text-xl font-bold">1</span>
                                </div>
                            </div>
                        </div>

                        {/* Detail Biaya */}
                        <div className="text-xs sm:text-sm">
                            <div className="flex justify-between mt-1">
                                <span className="text-white/70">You will pay</span>
                                <span className="font-bold"> {slide.price} $TEA</span>
                            </div>
                        </div>

                        {/* Progress Bar Supply (Disamakan dengan RafflePage.tsx) */}
                        <div className="mt-5 mb-4">
                            <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span>Progress</span>
                                <span>{Math.round(supplyProgressPercentage)}% Sold</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                                <div
                                    className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${supplyProgressPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-xs text-gray-300 mt-1">
                                {isSupplySoldOut ? "Sold Out!" : `${currentTotalSupply.toLocaleString()}/${currentMaxSupply.toLocaleString()} minted`}
                            </p>
                        </div>


                        {/* Tombol Mint */}
                        <button
                            onClick={handleMint}
                            disabled={!isConnected || isMintingProcess || previewImageSources.length === 0 || isSupplySoldOut}
                            aria-busy={isMintingProcess ? "true" : "false"}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white text-xl font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-green-400/50 flex items-center justify-center gap-3 transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isMintingProcess ? (
                                <>
                                    <Loader className="animate-spin" size={24} /> Minting...
                                </>
                            ) : (
                                "Mint Your NFT"
                            )}
                        </button>

                        {/* Footer */}
                        <div className="pt-2 border-t border-gray-700 text-center">
                            <p className="text-xs sm:text-sm text-white/70">
                                Powered by tea.xyz
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}