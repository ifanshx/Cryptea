// app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
// import { publicClient } from '@/config/wagmi'; // Anda mungkin perlu publicClient untuk membaca data on-chain di sini
// import { StakeNFTABI, StakeNFTAddress } from '@/constants/ContractAbi';

// Contoh data mock untuk leaderboard yang akan diganti dengan data on-chain atau dari database
const MOCK_LEADERBOARD_DATA = [
  { address: "0x32A4B3A8B123C4D5E6F7A8B9C0D1E2F3A4B5A5C4", amount: 200000 },
  { address: "0xAB8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4G1234", amount: 20000 },
  { address: "0xCD1E2F3A4B5C6D7E8F9A0B1C2D3E4F5G6H5678", amount: 2000 },
  { address: "0xEF0123456789ABCDEF0123456789ABCDEF9ABC", amount: 1000 },
  { address: "0x0123456789ABCDEF0123456789ABCDEF012345", amount: 900 },
  { address: "0x6789012345678901234567890123456789012345", amount: 500 },
  { address: "0x2345678901234567890123456789012345678901", amount: 60 },
  { address: "0x2145378901234567890123456789012345678901", amount: 60 },
  { address: "0x4341278901234567890123456789012345678901", amount: 60 },
];

export async function GET() {
  // --- Ini adalah bagian yang akan diganti dengan logic fetching data on-chain nyata ---
  // Contoh menggunakan wagmi's publicClient untuk membaca data dari smart contract
  // Ini memerlukan wagmi config Anda diekspos sebagai publicClient
  /*
  try {
    // Asumsi: Kontrak Anda memiliki fungsi untuk mendapatkan semua staker atau
    // Anda memiliki daftar staker dari event logs atau database.
    // Jika tidak ada fungsi ini, Anda perlu indexer (seperti The Graph)
    // atau database off-chain yang mengumpulkan data.

    // Contoh pseudo-code jika ada fungsi `getAllStakedAmounts` yang mengembalikan `[{address, amount}]`
    // const rawLeaderboard = await publicClient.readContract({
    //   address: StakeNFTAddress,
    //   abi: StakeNFTABI,
    //   functionName: 'getAllStakedAmounts', // Fungsi contoh
    // });

    // Transformasi data jika diperlukan
    // const transformedLeaderboard = rawLeaderboard.map((entry: any) => ({
    //   address: entry.stakerAddress,
    //   amount: Number(formatEther(entry.totalStaked)), // Sesuaikan dengan unit token Anda
    // }));

    // return NextResponse.json(transformedLeaderboard);

    // Untuk demo, kita gunakan mock data
    return NextResponse.json(MOCK_LEADERBOARD_DATA);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json({ message: "Failed to fetch leaderboard data." }, { status: 500 });
  }
  */

  // Untuk sementara, kirim data mock:
  return NextResponse.json(MOCK_LEADERBOARD_DATA);
}
