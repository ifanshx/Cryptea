// components/GeneratePopup.tsx
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
import { Images, Loader, Shuffle, Sparkles, } from "lucide-react"; // Import X untuk tombol tutup popup

import { PinataSDK } from "pinata";
import { useToast } from "@/context/ToastContext"; // Sesuaikan path jika berbeda
import { METADATA_TRAITS } from "@/constants/Herbivores/Herbivores_traits";
import { HerbivoresABI, HerbivoresAddress } from "@/constants/ContractAbi";
import LoadingSpinner from "@/components/LoadingSekleton"; // Import komponen LoadingSpinner yang sudah disempurnakan

// =================================================================
// NOTE PENTING:
// Pinata JWT harus disimpan di sisi server (misal: di API Route Next.js).
// Mengekspos JWT di client-side adalah risiko keamanan yang serius.
// Untuk tujuan demonstrasi dan perbaikan, JWT tetap di sini,
// TAPI HARAP PINDAHKAN KE BACKEND SESUAI BEST PRACTICE KEAMANAN!
// =================================================================
const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1ZmRkZjMxZTA2NDY3NjBlM2MzZjkiLCJzY29wZWRLZXlTZWNyZXQiOiI1MGViZWNmZDhjYjRkMDJiZThhYzk0NzM4YjRmOWViZTJhNTI3M2RlZjdjNDgyMmYwZjdhMjhiNjc3NDY2ZjZiYiIsImV4cCI6MTc3OTcyODgyNX0.OznvnGrfq_ztmcQwJ06wnGWHP2DiodSwG6dKNxuDQ14",
    pinataGateway: "red-equivalent-hawk-791.mypinata.cloud",
});

// Tipe untuk trait
type TraitType = keyof typeof METADATA_TRAITS;
type SelectedTraits = Record<TraitType, string>;

// Urutan lapisan untuk komposisi gambar
const LAYER_ORDER: TraitType[] = [
    "Background",
    "Body",
    "Head",
    "Eyes",
    "Mouth",
    "Neck",
];

// Fungsi untuk mendapatkan trait yang diurutkan
const getOrderedTraits = (): TraitType[] =>
    LAYER_ORDER.filter((t) => t in METADATA_TRAITS) as TraitType[];

// Enum untuk status carousel (tidak diubah)
enum Status {
    LIVE = "Live",
    FINISH = "Finish",
    LIVE_GENERATE = "Live Generate",
    COMING_SOON = "Coming Soon",
}

// Interface untuk slide carousel (tidak diubah)
interface CarouselSlide {
    name: string;
    image: string;
    assetFolder: string;
    status: Status;
    button: string;
    openseaSlug: string;
    price: string;
}

// Props untuk komponen GeneratePopup (tidak diubah)
interface GeneratePopupProps {
    slide: CarouselSlide;
    onClose: () => void;
}

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
};

export default function GeneratePopup({ slide, onClose }: GeneratePopupProps) {
    const { assetFolder: folder, name: collectionName, price } = slide;
    const traits = getOrderedTraits();
    const { addToast } = useToast(); // Menggunakan useToast dari context
    const { isConnected, address } = useAccount();

    // State lokal
    const [activeTrait, setActiveTrait] = useState<TraitType>("Background");
    const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>(
        traits.reduce((acc, t) => ({ ...acc, [t]: "" }), {} as SelectedTraits)
    );
    const [isUploading, setIsUploading] = useState(false); // Status upload IPFS
    const [isRandomizing, setIsRandomizing] = useState(false); // Status pengacakan trait
    const [currentLoaderMessage, setCurrentLoaderMessage] = useState(""); // Pesan untuk loader global

    // Ref untuk melacak status transaksi sebelumnya (untuk menghindari duplikat toast)
    const prevIsConfirming = useRef(false);
    const prevIsConfirmed = useRef(false);
    const prevTxError = useRef<BaseError | Error | null>(null);

    // Cache gambar yang sudah dimuat untuk optimasi
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

    // Wagmi hooks untuk interaksi dengan smart contract
    const { data: balance } = useBalance({ address });
    const { data: maxSupply } = useReadContract({
        address: HerbivoresAddress,
        abi: HerbivoresABI,
        functionName: "MAX_SUPPLY",
    });
    const { data: totalSupply } = useReadContract({
        address: HerbivoresAddress,
        abi: HerbivoresABI,
        functionName: "totalSupply",
    });

    const {
        data: txHash,
        error: txError,
        isPending, // True saat transaksi menunggu konfirmasi pengguna di wallet
        writeContract,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash: txHash });

    // State turunan untuk indikator komposisi & minting
    const isGeneratingPreview = isRandomizing; // Hanya ketika mengacak
    const isMintingProcess = isPending || isConfirming || isUploading; // Seluruh proses minting

    // Fungsi untuk mengacak trait
    const handleRandomize = useCallback(() => {
        setIsRandomizing(true);
        const randomTraits = traits.reduce((acc, t) => {
            const options = METADATA_TRAITS[t];
            // Pastikan ada opsi yang tersedia
            if (options && options.length > 0) {
                return {
                    ...acc,
                    [t]: options[Math.floor(Math.random() * options.length)],
                };
            }
            return acc; // Lewati jika tidak ada opsi
        }, {} as SelectedTraits);

        setTimeout(() => {
            setSelectedTraits(randomTraits);
            setIsRandomizing(false);
        }, 500); // Penundaan untuk efek visual
    }, [traits]);

    // Fungsi untuk memilih trait
    const handleSelectTrait = useCallback(
        (asset: string) => {
            setSelectedTraits((prev) => ({
                ...prev,
                [activeTrait]: prev[activeTrait] === asset ? "" : asset, // Toggle selection
            }));
        },
        [activeTrait]
    );

    // Fungsi untuk menyusun gambar dari lapisan dengan caching
    const composeImage = useCallback(
        async (traitsMap: SelectedTraits): Promise<string> => {
            const canvas = document.createElement("canvas");
            const size = 520; // Ukuran gambar NFT, sedikit lebih besar untuk menghindari artefak
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Canvas context not available");
            }

            // Gambar latar belakang default jika tidak ada background terpilih
            if (!traitsMap["Background"]) {
                ctx.fillStyle = "#F0F0F0"; // Warna abu-abu terang default
                ctx.fillRect(0, 0, size, size);
            }

            for (const t of LAYER_ORDER) {
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

    // Logika minting
    const handleMint = useCallback(async () => {
        // Validasi awal
        if (!isConnected || !address) {
            return addToast({ message: TOAST_MESSAGES.CONNECT_WALLET, type: "error" });
        }

        if ((balance?.value ?? BigInt(0)) < parseEther(price)) {
            return addToast({ message: TOAST_MESSAGES.INSUFFICIENT_BALANCE, type: "error" });
        }

        if (totalSupply !== undefined && maxSupply !== undefined && totalSupply >= maxSupply) {
            return addToast({ message: TOAST_MESSAGES.MAX_SUPPLY_REACHED, type: "error" });
        }

        const missingTraits = traits.filter((t) => !selectedTraits[t]);
        if (missingTraits.length) {
            return addToast({ message: TOAST_MESSAGES.MISSING_TRAITS(missingTraits), type: "error" });
        }

        // --- Proses Minting Dimulai ---
        setCurrentLoaderMessage("Preparing your NFT..."); // Pesan awal loader
        setIsUploading(true); // Mengindikasikan proses upload dimulai

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
                imgRes = await pinata.upload.public.file(imageFile);
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
                attributes: LAYER_ORDER.map((t) => ({
                    trait_type: t,
                    value: selectedTraits[t] || "None",
                })),
                created_at: new Date().toISOString(),
            };
            const metaBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });
            const metaFile = new File([metaBlob], `${collectionName}_${prefix}_${ts}_meta.json`, { type: "application/json" });

            let metaRes;
            try {
                metaRes = await pinata.upload.public.file(metaFile);
            } catch (pinataError) {
                console.error("Pinata metadata upload error:", pinataError);
                // Jika metadata gagal diupload, coba hapus gambar yang sudah diupload
                // (Ini opsional, tergantung kebijakan Anda)
                // await pinata.files.public.delete([imgRes.id]);
                throw new Error(TOAST_MESSAGES.PINATA_UPLOAD_ERROR('metadata'));
            }

            // 3. Initiate Minting Transaction
            addToast({ message: TOAST_MESSAGES.MINTING, type: "info" });
            setCurrentLoaderMessage(TOAST_MESSAGES.MINTING);

            writeContract({
                address: HerbivoresAddress,
                abi: HerbivoresABI,
                functionName: "mint",
                args: [`ipfs://${metaRes.cid}`],
                value: parseEther(price),
            });

        } catch (err) {
            console.error("Minting process error:", err);
            const errorMessage = (err instanceof Error) ? err.message : TOAST_MESSAGES.GENERIC_ERROR;
            addToast({ message: errorMessage, type: "error" });
            setIsUploading(false); // Pastikan status upload direset
            setCurrentLoaderMessage(""); // Bersihkan pesan loader
        } finally {
            // setIsUploading(false); // Jangan langsung matikan di sini, biarkan useEffect Wagmi yang menangani
            // setShowGlobalLoader(false); // Jangan langsung matikan di sini
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
            // Berikan waktu sejenak untuk user melihat pesan sukses sebelum menutup popup
            setTimeout(() => {
                onClose();
                setCurrentLoaderMessage(""); // Reset pesan loader
                setIsUploading(false); // Reset status upload
            }, 1500); // Delay 1.5 detik
        }
        prevIsConfirmed.current = isConfirmed;

        // Penanganan error transaksi Wagmi
        if (txError && txError !== prevTxError.current) {
            const errorMessage =
                txError instanceof BaseError
                    ? txError.shortMessage || txError.message
                    : TOAST_MESSAGES.GENERIC_ERROR;
            addToast({ message: TOAST_MESSAGES.TX_FAILED(errorMessage), type: "error" });
            setCurrentLoaderMessage(""); // Reset pesan loader
            setIsUploading(false); // Reset status upload
            // Tidak perlu menghapus file dari Pinata di sini, karena Pinata upload sudah ditangani di try-catch handleMint
            // dan penghapusan otomatis dari Pinata mungkin tidak diinginkan jika NFT akhirnya di-mint oleh orang lain
            // atau jika Anda ingin debug manual. Ini adalah keputusan desain.
        }
        prevTxError.current = txError;

        // Kapan global loader harus disembunyikan
        // Sembunyikan loader global jika tidak ada lagi proses minting yang aktif,
        // dan tidak ada error transaksi baru yang perlu ditangani.
        if (!isPending && !isConfirming && !isUploading && !txError && currentLoaderMessage) {
            setCurrentLoaderMessage("");
        }

    }, [isConfirming, isConfirmed, txError, addToast, onClose, isPending, isUploading, currentLoaderMessage]);


    // Status komputasi untuk menonaktifkan tombol
    const isGeneratingOrProcessing = isRandomizing || isMintingProcess; // Menggabungkan semua state loading

    // URL gambar pratinjau yang disusun
    const previewImageSources = useMemo(
        () =>
            LAYER_ORDER.filter((t) => selectedTraits[t]).map(
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
            {isMintingProcess && ( // Tampilkan loader hanya jika ada proses minting aktif
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
                                    {METADATA_TRAITS[activeTrait].length} options
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
                                    onChange={(e) => setActiveTrait(e.target.value as TraitType)}
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
                                {METADATA_TRAITS[activeTrait].map((asset) => (
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
                        <div className="mt-5 mb-4"> {/* Menggunakan mt-5 dan mb-4 seperti RafflePage */}
                            <div className="flex justify-between text-xs text-gray-300 mb-1"> {/* Warna teks disesuaikan untuk background gelap */}
                                <span>Progress</span>
                                <span>{Math.round(supplyProgressPercentage)}% Sold</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2"> {/* Warna background bar disesuaikan */}
                                <div
                                    className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out" // Warna progress dan transisi sama
                                    style={{ width: `${supplyProgressPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-xs text-gray-300 mt-1"> {/* Warna teks disesuaikan untuk background gelap */}
                                {isSupplySoldOut ? "Sold Out!" : `${currentTotalSupply.toLocaleString()}/${currentMaxSupply.toLocaleString()} minted`}
                            </p>
                        </div>


                        {/* Tombol Mint */}
                        <button
                            onClick={handleMint}
                            disabled={!isConnected || isMintingProcess || previewImageSources.length === 0} // Nonaktifkan jika belum ada gambar yang dipilih
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