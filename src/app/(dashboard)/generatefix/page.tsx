"use client";

import {
  CubeTransparentIcon,
  PhotoIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { METADATA_TRAITS } from "@/constants/metadata";
import { useToast } from "@/context/ToastContext";
// import { PinataSDK } from "pinata";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  BaseError,
  useAccount,
  useBalance,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { mintNFTABI, mintNFTAddress } from "@/constants/ContractAbi";

// Inisialisasi Pinata SDK
// const pinata = new PinataSDK({
//   pinataJwt:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhZGM4OGQ0OC0wMDg4LTRjMmMtOGIxMS01NjRkODQxZTMwYzAiLCJlbWFpbCI6ImlyZmFhbnNob29kaXExOTU0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNjE4OTRkYzRiNTM3Y2VlZjg4YyIsInNjb3BlZEtleVNlY3JldCI6IjRjNjg1YTIxOWQwM2FiOTAwZWYyMGU1Y2I2MGZhMDRjMzdiODA0ZWE0NWViNDFhZDk1MjM0ZmRiNDkwMThiNjkiLCJleHAiOjE3Njk5NDEwOTZ9.kElikjPEK_-KCZom76QxOroAHEc-2jAmiqBRjrieZJk",
//   pinataGateway: "https://red-equivalent-hawk-791.mypinata.cloud/",
// });

// Definisi tipe untuk trait
type TraitType =
  | "Background"
  | "Speciality"
  | "Skin"
  | "Clothes"
  | "Beard"
  | "Head"
  | "Eyes"
  | "Mustache"
  | "Nose"
  | "Coin"
  | "Hands";

type SelectedTraits = {
  [key in TraitType]: string;
};

const GenerateImagePage = () => {
  const traits: TraitType[] = [
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

  const { showToast } = useToast();
  const { isConnected, address } = useAccount();

  // Mengambil saldo wallet menggunakan useBalance
  const { data: balanceData } = useBalance({
    address: address,
  });

  // State untuk trait aktif, list trait, supply, dan status upload
  const [activeTraits, setActiveTraits] = useState<TraitType>("Background");
  const [listTraits, setListTraits] = useState<string[]>([]);
  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<number | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    Background: "",
    Speciality: "",
    Skin: "",
    Clothes: "",
    Beard: "",
    Head: "",
    Eyes: "",
    Mustache: "",
    Nose: "",
    Coin: "",
    Hands: "",
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Membersihkan localStorage saat mount (jika diperlukan)
  useEffect(() => {
    localStorage.clear();
  }, []);

  // Update listTraits berdasarkan trait aktif
  useEffect(() => {
    const defaultTraits = METADATA_TRAITS[activeTraits] || [];
    setListTraits([...defaultTraits]);
  }, [activeTraits]);

  // Fungsi untuk memilih trait secara acak untuk setiap kategori
  const handleRandomTraits = (): void => {
    const randomSelection: Partial<SelectedTraits> = {};
    traits.forEach((trait) => {
      const options = METADATA_TRAITS[trait] as string[] | undefined;
      if (options && options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        randomSelection[trait] = options[randomIndex];
      } else {
        console.warn(`No available options for trait: ${trait}`);
        randomSelection[trait] = "";
      }
    });
    setSelectedTraits(randomSelection as SelectedTraits);
  };

  // Fungsi untuk memilih atau membatalkan pilihan trait pada kategori aktif
  const handleSelectTrait = (item: string): void => {
    setSelectedTraits((prev) => ({
      ...prev,
      [activeTraits]:
        prev[activeTraits] === item
          ? activeTraits === "Background"
            ? item
            : ""
          : item,
    }));
  };

  // Wagmi hooks for contract interactions
  const {
    data: txHash,
    error: txError,
    isPending,
    writeContract,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Use refs to track previous transaction states to avoid duplicate toast notifications
  const prevIsConfirming = useRef<boolean>(false);
  const prevIsConfirmed = useRef<boolean>(false);
  const prevTxError = useRef<BaseError | Error | null>(null);

  // const [imageFileId, setImageFileId] = useState<string | null>(null);
  // const [metadataFileId, setMetadataFileId] = useState<string | null>(null);

  useEffect(() => {
    if (isConfirming && !prevIsConfirming.current) {
      showToast("Transaction is being confirmed...", "info");
    }
    prevIsConfirming.current = isConfirming;

    if (isConfirmed && !prevIsConfirmed.current) {
      showToast("NFT Minted Successfully!", "success");
    }
    prevIsConfirmed.current = isConfirmed;

    if (txError && txError !== prevTxError.current) {
      const errorMessage =
        txError instanceof BaseError
          ? txError.shortMessage || txError.message
          : "Transaction Failed";
      showToast(errorMessage, "error");
      // 🔥 Hapus file dari Pinata jika transaksi gagal
      // (async () => {
      //   if (imageFileId) {
      //     try {
      //       await pinata.files.public.delete([imageFileId]);
      //       console.log(
      //         `File with ID ${imageFileId} deleted due to transaction failure.`
      //       );
      //     } catch (deleteError) {
      //       console.error(
      //         `Failed to delete image with ID ${imageFileId}:`,
      //         deleteError
      //       );
      //     }
      //   }

      //   if (metadataFileId) {
      //     try {
      //       await pinata.files.public.delete([metadataFileId]);
      //       console.log(
      //         `File with ID ${metadataFileId} deleted due to transaction failure.`
      //       );
      //     } catch (deleteError) {
      //       console.error(
      //         `Failed to delete metadata with ID ${metadataFileId}:`,
      //         deleteError
      //       );
      //     }
      //   }
      // })
      // ();

      prevTxError.current = txError;
    }
  }, [
    isConfirming,
    isConfirmed,
    txError,
    // imageFileId,
    // metadataFileId,
    showToast,
  ]);

  // Read contract values for maxSupply and totalSupply
  const { data: maxSupplyData } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "MAX_SUPPLY",
  });

  const { data: totalSupplyData } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "totalSupply",
  });

  useEffect(() => {
    if (maxSupplyData) setMaxSupply(Number(maxSupplyData));
    if (totalSupplyData) setTotalSupply(Number(totalSupplyData));
  }, [maxSupplyData, totalSupplyData]);

  // Read the minted NFT count for the connected user
  const { data: mintedCount } = useReadContract({
    address: mintNFTAddress,
    abi: mintNFTABI,
    functionName: "userBalance",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  // Function to mint the NFT
  // const handleMintNFT = async (): Promise<string | null> => {
  //   if (!isConnected) {
  //     showToast("Please connect your wallet first", "error");
  //     return null;
  //   }

  //   let imageCID: string | null = null;
  //   let metadataCID: string | null = null;
  //   let imageFileId: string | null = null;
  //   let metadataFileId: string | null = null;

  //   try {
  //     setIsUploading(true);
  //     showToast("Uploading image...", "info");

  //     // Nama dan deskripsi NFT
  //     const nftName = "Ethereal Entities";
  //     const nftDescription =
  //       "Ethereal Entities is an NFT collection featuring mystical creatures from another world.";

  //     // 🔥 1. Optimalkan ukuran canvas
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) throw new Error("Could not get canvas context");

  //     canvas.width = 150; // 🔥 Ukuran lebih kecil agar file tidak besar
  //     canvas.height = 150;

  //     // Fungsi untuk load dan menggambar trait pada canvas
  //     const loadImage = async (trait: TraitType): Promise<void> => {
  //       if (!selectedTraits[trait]) return;
  //       return new Promise<void>((resolve, reject) => {
  //         const img = new Image();
  //         img.onload = () => {
  //           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //           resolve();
  //         };
  //         img.onerror = () =>
  //           reject(new Error(`Failed to load image for trait ${trait}`));

  //         if (selectedTraits[trait].startsWith("custom-")) {
  //           const dataUrl = localStorage.getItem(selectedTraits[trait]);
  //           img.src = dataUrl || "";
  //         } else {
  //           img.src = `/assets/${trait}/${selectedTraits[trait]}`;
  //         }
  //       });
  //     };

  //     await Promise.all(traits.map((trait) => loadImage(trait)));

  //     // 🔥 2. Simpan ke WEBP (lebih kecil)
  //     const blob = await new Promise<Blob>((resolve, reject) =>
  //       canvas.toBlob(
  //         (b) =>
  //           b ? resolve(b) : reject(new Error("Failed to create WEBP blob")),
  //         "image/webp",
  //         0.8
  //       )
  //     );

  //     // Upload ke IPFS (Pinata)
  //     const imageFile = new File([blob], `${nftName}.webp`, {
  //       type: "image/webp",
  //     });
  //     const imageUploadResponse = await pinata.upload.public.file(imageFile);
  //     imageFileId = imageUploadResponse.id; // Simpan ID file gambar
  //     setImageFileId(imageFileId); // Simpan imageFileId di state
  //     imageCID = imageUploadResponse.cid; // Simpan CID gambar
  //     const imageUrl = `https://red-equivalent-hawk-791.mypinata.cloud/ipfs/${imageCID}`;

  //     showToast("Uploading metadata...", "info");

  //     // Metadata NFT
  //     const metadata = {
  //       name: nftName,
  //       description: nftDescription,
  //       image: imageUrl,
  //       attributes: traits.map((trait) => ({
  //         trait_type: trait,
  //         value: selectedTraits[trait] || "None",
  //       })),
  //     };

  //     // Upload Metadata ke IPFS
  //     const metadataFile = new File(
  //       [JSON.stringify(metadata, null, 2)],
  //       `${nftName}.json`,
  //       { type: "application/json" }
  //     );
  //     const metadataUploadResponse = await pinata.upload.public.file(
  //       metadataFile
  //     );
  //     metadataFileId = metadataUploadResponse.id; // Simpan ID file metadata
  //     setMetadataFileId(metadataFileId); // Simpan metadataFileId di state
  //     metadataCID = metadataUploadResponse.cid; // Simpan CID metadata

  //     const metadataUri = `ipfs://${metadataCID}`;

  //   setIsUploading(false);

  //     // Mint NFT dengan metadata URI
  //     writeContract({
  //       address: mintNFTAddress,
  //       abi: mintNFTABI,
  //       functionName: "mint",
  //       args: [BigInt(1), metadataUri],
  //       value: parseEther("2"),
  //     });

  //     return "Minting successful";
  //   } catch (error) {
  //     showToast("Error during NFT minting", "error");
  //     console.error(error);

  //     try {
  //       if (imageFileId) {
  //         showToast("Deleting image from Pinata...", "info");
  //         const deleteImageResponse = await pinata.files.public.delete([
  //           imageFileId,
  //         ]);

  //         if (
  //           deleteImageResponse.length > 0 &&
  //           deleteImageResponse[0].status === "success"
  //         ) {
  //           console.log(`File with ID ${imageFileId} deleted successfully.`);
  //           showToast("Image deleted from Pinata", "success");
  //         } else {
  //           console.error(
  //             `Failed to delete image with ID ${imageFileId}:`,
  //             deleteImageResponse
  //           );
  //           showToast("Failed to delete image from Pinata", "error");
  //         }
  //       }

  //       if (metadataFileId) {
  //         showToast("Deleting metadata from Pinata...", "info");
  //         const deleteMetadataResponse = await pinata.files.public.delete([
  //           metadataFileId,
  //         ]);

  //         if (
  //           deleteMetadataResponse.length > 0 &&
  //           deleteMetadataResponse[0].status === "success"
  //         ) {
  //           console.log(`File with ID ${metadataFileId} deleted successfully.`);
  //           showToast("Metadata deleted from Pinata", "success");
  //         } else {
  //           console.error(
  //             `Failed to delete metadata with ID ${metadataFileId}:`,
  //             deleteMetadataResponse
  //           );
  //           showToast("Failed to delete metadata from Pinata", "error");
  //         }
  //       }
  //     } catch (deleteError) {
  //       console.error("Error deleting file from Pinata:", deleteError);
  //       showToast("Error deleting file from Pinata", "error");
  //     }

  //     setIsUploading(false);
  //     return null;
  //   }
  // };

  const handleMintNFT = async (): Promise<string | null> => {
    if (!isConnected) {
      showToast("Please connect your wallet first", "error");
      return null;
    }

    try {
      setIsUploading(true);
      showToast("Preparing NFT mint with fallback URIs...", "info");

      const metadataUri =
        "https://red-equivalent-hawk-791.mypinata.cloud/ipfs/bafkreib6i5tbbaszc6d4ty7pizi3uhlkxkhuggzyiek3y3p4nhmqjgeli4";

      // Jika diperlukan, kamu masih bisa melakukan pembuatan canvas untuk preview
      // Namun, karena upload ke IPFS tidak diperlukan, kita lewati langkah tersebut

      setIsUploading(false);

      // Mint NFT menggunakan metadata URI fallback
      writeContract({
        address: mintNFTAddress,
        abi: mintNFTABI,
        functionName: "mint",
        args: [BigInt(1), metadataUri],
        value: parseEther("2"),
      });

      return "Minting successful";
    } catch (error) {
      showToast("Error during NFT minting", "error");
      console.error(error);
      setIsUploading(false);
      return null;
    }
  };

  // Membuat preview image berdasarkan trait yang telah dipilih
  const previewImage = useMemo(() => {
    return traits
      .map((trait) => {
        if (!selectedTraits[trait]) return null;
        return selectedTraits[trait].startsWith("custom-")
          ? localStorage.getItem(selectedTraits[trait]) || ""
          : `/assets/${trait}/${selectedTraits[trait]}`;
      })
      .filter((src) => src !== null) as string[];
  }, [selectedTraits, traits]);

  const stats = [
    {
      title: "Total Minted",
      value: totalSupply,
      icon: PhotoIcon,
      color: "from-pink-400 to-purple-400",
    },
    {
      title: "Max Supply",
      value: maxSupply,
      icon: PhotoIcon,
      color: "from-blue-400 to-cyan-400",
    },
  ];
  return (
    <main className="container mx-auto px-4 py-10 md:py-20 max-w-7xl">
      {/* Header Section */}
      <header className="text-center mb-12 space-y-3">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur-2xl opacity-30 animate-pulse" />
          <h1 className="relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Ethereal Entities
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Create your unique digital masterpiece with the NFT generator
        </p>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 ">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg transform group-hover:rotate-12 transition-all">
                <stat.icon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trait Selector Panel */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-4 space-y-4">
            {/* Navigation Tabs */}
            <nav className="space-y-2">
              <div className="hidden md:flex flex-wrap gap-2 justify-center p-1 bg-gray-50 rounded-xl">
                {traits.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTraits(item)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTraits === item
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Mobile Select */}
              <div className="md:hidden">
                <select
                  value={activeTraits}
                  onChange={(e) => setActiveTraits(e.target.value as TraitType)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-200"
                >
                  {traits.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </nav>
            {/* Traits Grid */}
            <div className="bg-gray-50  rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-[450px] overflow-y-auto p-3 custom-scrollbar">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {listTraits.map((item) => (
                    <button
                      key={`${activeTraits}-${item}`}
                      onClick={() => handleSelectTrait(item)}
                      className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all group ${selectedTraits[activeTraits] === item
                        ? "border-purple-500 shadow-xl"
                        : "border-gray-200 hover:border-purple-300"
                        }`}
                    >
                      {selectedTraits[activeTraits] === item && (
                        <div className="absolute top-2 right-2 bg-purple-500 p-1.5 rounded-full shadow-sm z-10">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <img
                        src={
                          item.startsWith("custom-")
                            ? localStorage.getItem(item) || ""
                            : `/assets/${activeTraits}/${item}`
                        }
                        alt="Trait"
                        className="w-full h-full object-cover transform transition duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Panel */}
        <section className="sticky top-6 h-fit bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
            {traits.some((t) => selectedTraits[t]) ? (
              traits.map(
                (trait) =>
                  selectedTraits[trait] && (
                    <img
                      key={trait}
                      src={
                        selectedTraits[trait].startsWith("custom-")
                          ? localStorage.getItem(selectedTraits[trait]) || ""
                          : `/assets/${trait}/${selectedTraits[trait]}`
                      }
                      alt={trait}
                      className="absolute inset-0 object-contain w-full h-full p-4 animate-float"
                    />
                  )
              )
            ) : (
              <div className="text-center p-6">
                <div className="mb-4 mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
                  <SparklesIcon className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-600 text-sm">
                  Combine traits to preview your NFT masterpiece
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Bar */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-xl border border-gray-200 max-w-2xl w-[95%] backdrop-blur-sm">
        <div className="p-3 flex items-center justify-between gap-4">
          <button
            onClick={handleRandomTraits}
            className="px-5 py-2.5 flex items-center gap-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
          >
            <CubeTransparentIcon className="w-5 h-5 text-purple-500 animate-dance" />
            <span className="text-sm font-semibold">Randomize</span>
          </button>

          <button
            onClick={handleMintNFT}
            disabled={
              !isConnected ||
              !previewImage.length ||
              (mintedCount !== undefined && Number(mintedCount) >= 20) ||
              isPending ||
              isUploading ||
              (balanceData && balanceData.value < parseEther("2"))
            }
            className={`px-6 py-3 flex items-center gap-2 rounded-xl transition-all ${!isConnected ||
              !previewImage.length ||
              (mintedCount && Number(mintedCount) >= 20) ||
              isPending ||
              isUploading ||
              (balanceData && balanceData.value < parseEther("2"))
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg"
              }`}
          >
            {isUploading || isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">
                  {isUploading ? "Uploading..." : "Minting..."}
                </span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 text-amber-200" />
                <span className="text-sm font-semibold">Mint NFT</span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                  {mintedCount}/20 left
                </span>
              </>
            )}
          </button>
        </div>
      </footer>
    </main>
  );
};

export default GenerateImagePage;
