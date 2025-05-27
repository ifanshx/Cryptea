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
import { Images, Loader, Sparkles } from "lucide-react";

import { PinataSDK } from "pinata";
import { useToast } from "@/context/ToastContext";
import { METADATA_TRAITS } from "@/constants/Herbivores/Herbivores_traits";
import { HerbivoresABI, HerbivoresAddress } from "@/constants/ContractAbi";

// Inisialisasi Pinata SDK
const pinata = new PinataSDK({

    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1ZmRkZjMxZTA2NDY3NmUzYzNmOSIsInNjb3BlZEtleVNlY3JldCI6IjUwZWJlY2ZkYzhiNGQwMmJlOGFjOTQ3MzhiNGY5ZWJlMmE1MjczZGVmN2M0ODIyZjBmN2EyOGI2Nzc0NjZmNmIiLCJleHAiOjE3Nzk3Mjg4MjV9.OznvnGrfq_ztmcQwJ06wnGWHP2DiodSwG6dKNxuDQ14",

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

// Enum untuk status carousel (tidak diubah, ini sudah baik)
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
    MISSING_TRAITS: (missing: string[]) => `Please select: ${missing.join(", ")}.`,
    UPLOADING_IMAGE: "Uploading image to IPFS...",
    UPLOADING_METADATA: "Uploading metadata to IPFS...",
    MINTING: "Initiating minting transaction...",
    MINT_SUCCESS: "NFT Minted Successfully! 🥳 Check your wallet.",
    MINT_FAILED: "Minting failed. Please try again.",
    CONFIRMING_TX: "Confirming transaction on blockchain...",
    TX_FAILED: (msg: string) => `Transaction failed: ${msg}`,
    GENERIC_ERROR: "An unexpected error occurred.",
};

export default function GeneratePopup({ slide, onClose }: GeneratePopupProps) {
    const { assetFolder: folder, name: collectionName, price } = slide;
    const traits = getOrderedTraits();
    const { showToast } = useToast();
    const { isConnected, address } = useAccount();

    // State lokal
    const [activeTrait, setActiveTrait] = useState<TraitType>("Background");
    const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>(
        traits.reduce((acc, t) => ({ ...acc, [t]: "" }), {} as SelectedTraits)
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isRandomizing, setIsRandomizing] = useState(false);
    const [imageFileId, setImageFileId] = useState<string | null>(null);
    const [metadataFileId, setMetadataFileId] = useState<string | null>(null);
    // *** New state for global loading overlay ***
    const [showGlobalLoader, setShowGlobalLoader] = useState(false);

    // Ref untuk melacak status transaksi sebelumnya
    const prevIsConfirming = useRef(false);
    const prevIsConfirmed = useRef(false);
    const prevTxError = useRef<BaseError | Error | null>(null);

    // Cache gambar yang sudah dimuat untuk optimasi
    // Kunci adalah path gambar, nilai adalah objek Image yang sudah dimuat
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
        isPending,
        writeContract,
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({ hash: txHash });

    // State turunan untuk indikator komposisi
    const isComposing = isUploading && !isRandomizing;

    // Fungsi untuk mengacak trait
    const handleRandomize = useCallback(() => {
        setIsRandomizing(true);
        const randomTraits = traits.reduce((acc, t) => {
            const options = METADATA_TRAITS[t];
            return {
                ...acc,
                [t]: options[Math.floor(Math.random() * options.length)] || "",
            };
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
            const size = 512; // Ukuran gambar NFT
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Canvas context not available");
            }

            for (const t of LAYER_ORDER) {
                const asset = traitsMap[t];
                if (!asset) continue; // Lewati jika trait tidak dipilih

                const imagePath = `/assets/${folder}/${t}/${asset}`;
                let img = imageCache.current.get(imagePath);

                if (!img) {
                    // Jika gambar belum ada di cache, muat
                    img = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const newImg = new Image();
                        newImg.onload = () => {
                            imageCache.current.set(imagePath, newImg); // Simpan ke cache
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

            return canvas.toDataURL("image/webp", 0.9); // Mengembalikan Data URL gambar
        },
        [folder]
    );

    // Logika minting
    const handleMint = useCallback(async () => {
        // Validasi awal menggunakan konstan pesan toast
        if (!isConnected || !address) {
            return showToast(TOAST_MESSAGES.CONNECT_WALLET, "error");
        }
        // Menggunakan BigInt untuk perbandingan yang akurat
        if ((balance?.value ?? BigInt(0)) < parseEther(price)) {
            return showToast(TOAST_MESSAGES.INSUFFICIENT_BALANCE, "error");
        }
        // Memastikan maxSupply dan totalSupply adalah BigInt untuk perbandingan yang tepat
        if (totalSupply !== undefined && maxSupply !== undefined && totalSupply >= maxSupply) {
            return showToast(TOAST_MESSAGES.MAX_SUPPLY_REACHED, "error");
        }

        const missingTraits = traits.filter((t) => !selectedTraits[t]);
        if (missingTraits.length) {
            return showToast(TOAST_MESSAGES.MISSING_TRAITS(missingTraits), "error");
        }

        setShowGlobalLoader(true); // Tampilkan loader global
        setIsUploading(true);
        try {
            showToast(TOAST_MESSAGES.UPLOADING_IMAGE, "info");
            const dataUrl = await composeImage(selectedTraits);
            const blob = await fetch(dataUrl).then((r) => r.blob());
            const ts = Date.now();
            const prefix = address ? `${address.slice(2, 6)}_${address.slice(-4)}` : "anon";
            const imageName = `${collectionName}_${prefix}_${ts}_img.webp`;
            const imageFile = new File([blob], imageName, {
                type: "image/webp",
                lastModified: ts,
            });
            const imgRes = await pinata.upload.public.file(imageFile); // <--- ERROR DISINI
            setImageFileId(imgRes.id);

            showToast(TOAST_MESSAGES.UPLOADING_METADATA, "info");
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
            const metaBlob = new Blob([JSON.stringify(metadata)], {
                type: "application/json",
            });
            const metaFile = new File(
                [metaBlob],
                `${collectionName}_${prefix}_${ts}_meta.json`,
                { type: "application/json" }
            );
            const metaRes = await pinata.upload.public.file(metaFile); // <--- ATAU DISINI
            setMetadataFileId(metaRes.id);
            showToast(TOAST_MESSAGES.MINTING, "info");
            writeContract({
                address: HerbivoresAddress,
                abi: HerbivoresABI,
                functionName: "mint",
                args: [`ipfs://${metaRes.cid}`],
                value: parseEther(price),
            });
        } catch (err) {
            console.error(err);
            showToast("Mint failed", "error");
        } finally {
            setIsUploading(false);
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
        showToast,
        traits,
        collectionName,
        price,
    ]);

    // Efek samping untuk notifikasi transaksi dan pembersihan Pinata
    useEffect(() => {
        // Notifikasi "Confirming..."
        if (isConfirming && !prevIsConfirming.current) {
            showToast(TOAST_MESSAGES.CONFIRMING_TX, "info");
        }
        prevIsConfirming.current = isConfirming;

        // Notifikasi "Minted!"
        if (isConfirmed && !prevIsConfirmed.current) {
            showToast(TOAST_MESSAGES.MINT_SUCCESS, "success");
            setShowGlobalLoader(false); // Sembunyikan loader global saat sukses
            onClose(); // Mungkin tutup popup setelah minting sukses
        }
        prevIsConfirmed.current = isConfirmed;

        // Penanganan error transaksi
        if (txError && txError !== prevTxError.current) {
            const errorMessage =
                txError instanceof BaseError
                    ? txError.shortMessage || txError.message
                    : TOAST_MESSAGES.GENERIC_ERROR;
            showToast(TOAST_MESSAGES.TX_FAILED(errorMessage), "error");

            // Hapus file dari Pinata jika transaksi gagal
            (async () => {
                if (imageFileId) {
                    console.log("Deleting image from Pinata:", imageFileId);
                    await pinata.files.public.delete([imageFileId]);
                }
                if (metadataFileId) {
                    console.log("Deleting metadata from Pinata:", metadataFileId);
                    await pinata.files.public.delete([metadataFileId]);
                }
            })();
            setShowGlobalLoader(false); // Sembunyikan loader global saat error
            prevTxError.current = txError;
        }

        // Jika transaksi selesai (sukses atau gagal) dan tidak ada lagi yang pending/confirming/uploading, sembunyikan loader
        if (!isPending && !isConfirming && !isUploading && showGlobalLoader) {
            setShowGlobalLoader(false);
        }

    }, [isConfirming, isConfirmed, txError, imageFileId, metadataFileId, showToast, showGlobalLoader, isPending, isUploading, onClose]);

    // Status komputasi untuk menonaktifkan tombol
    const isGenerating = isUploading || isRandomizing; // Untuk Randomize/Compose
    const isMinting = isPending || isConfirming || isUploading; // Untuk tombol Mint

    // URL gambar pratinjau yang disusun
    const previewImage = useMemo(
        () =>
            LAYER_ORDER.filter((t) => selectedTraits[t]).map(
                (t) => `/assets/${folder}/${t}/${selectedTraits[t]}`
            ),
        [selectedTraits, folder]
    );

    return (
        <>
            {/* *** Global Loading Overlay *** */}
            {showGlobalLoader && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col items-center justify-center text-white text-lg">
                    <Loader className="w-12 h-12 text-teal-400 animate-spin mb-4" />
                    <p>Processing transaction...</p>
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
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition focus:outline-none ${activeTrait === trait
                                            ? "bg-teal-500 text-white shadow-lg"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                                            <div className="absolute top-2 right-2 bg-teal-500 text-white px-2 py-1 rounded-full text-xs">
                                                ✓
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Panel Pratinjau Gambar dan Randomize */}
                        <div className="bg-white w-full md:w-1/2 p-4 sm:p-6 flex flex-col gap-4 rounded-xl shadow-lg flex-shrink-0 max-h-none md:max-h-full">
                            <div className="aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center">
                                {isComposing ? (
                                    <div className="flex flex-col items-center animate-pulse space-y-4">
                                        <Loader className="w-10 h-10 text-teal-500 animate-spin" />
                                        <p className="text-gray-500">Assembling your unique NFT...</p>
                                    </div>
                                ) : previewImage.length ? (
                                    <div className="relative w-full h-full">
                                        {previewImage.map((src, i) => (
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
                                    <div className="flex flex-col items-center space-y-3">
                                        <Sparkles className="w-12 h-12 text-teal-200" />
                                        <p className="text-gray-400">Select traits to begin customizing!</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleRandomize}
                                disabled={isGenerating}
                                className="w-full bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-200 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 flex items-center justify-center"
                            >
                                {isRandomizing ? (
                                    <Loader className="animate-spin mr-2" size={18} />
                                ) : (
                                    "🎲"
                                )}
                                Randomize
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

                        {/* Tombol Mint */}
                        <button
                            onClick={handleMint}
                            disabled={!isConnected || isMinting || !previewImage.length}
                            aria-busy={isMinting}
                            className="w-full bg-white text-gray-900 rounded-lg py-2 font-bold hover:bg-gray-100 transition"
                        >
                            {isMinting ? "Minting..." : "Mint"}
                        </button>

                        {/* Progress Bar Supply */}
                        <div className="relative mt-2 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div
                                className="absolute h-full bg-white transition-all duration-300"
                                style={{
                                    width: `${
                                        // Konversi BigInt ke Number untuk persentase (asumsi tidak akan melebihi MAX_SAFE_INTEGER)
                                        (Number(totalSupply || BigInt(0)) / Number(maxSupply || BigInt(1))) * 100
                                        }%`,
                                }}
                            />
                        </div>
                        <div className="text-xs sm:text-sm text-white/70 text-right">
                            {totalSupply?.toString() || "0"}/{maxSupply?.toString() || "0"}
                        </div>

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