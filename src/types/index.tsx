// src/types/index.ts

import type { Abi } from "viem";

// Enum untuk status koleksi
export enum Status {
    LIVE = "Live",
    FINISH = "Finish",
    LIVE_GENERATE = "Live Generate",
    COMING_SOON = "Coming Soon",
}

// Interface untuk data slide carousel
export interface CarouselSlide {
    name: string;
    image: string;
    status: Status;
    button: string;
    openseaSlug: string;
    price: string;
    assetFolder: string;
    // Properti opsional karena tidak semua slide mungkin memiliki kontrak
    contractAddress?: `0x${string}`; // Menggunakan tipe string heksadesimal untuk alamat kontrak
    contractABI?: Abi;
    metadataTraits?: GenericMetadataTraits; // Menggunakan tipe yang sudah dipindahkan
    layerOrder?: readonly string[]; // Mengubah ke readonly string[]
    PinataGrup: string; // Grup Pinata untuk mengelompokkan aset

}

// Interface untuk data koleksi trending
export interface TrendingCollection {
    name: string;
    floor: string;
    floorChange: string;
    volume24: string;
    volume24Change: string;
    totalVolume: string;
    totalVolumeChange: string;
    owners: number;
    supply: number;
    avatar: string;
}

// =============================================================
// Tipe spesifik untuk GeneratePopup
// =============================================================

// Mengizinkan array string yang bisa diubah (mutable) atau readonly
export type GenericMetadataTraits = Record<string, string[] | readonly string[]>;

// Tipe untuk kunci (nama trait) dari GenericMetadataTraits
export type GenericTraitType = keyof GenericMetadataTraits;

// Tipe untuk trait yang dipilih (value-nya bisa string atau undefined/null)
export type SelectedGenericTraits = {
    [K in GenericTraitType]?: string; // Menjadikan value opsional
};

// Props untuk komponen GeneratePopup
export interface GeneratePopupProps {
    slide: CarouselSlide;
    onClose: () => void;
}