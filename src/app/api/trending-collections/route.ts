// app/api/trending-collections/route.ts
import { NextResponse } from "next/server";

// Ini adalah data dummy/mock. Ganti dengan fetch data dari API nyata.
const MOCK_TRENDING_COLLECTIONS = [
  {
    name: "Steamland",
    floor: "1 TEA",
    floorChange: "+37.23%",
    volume24: "24 TEA",
    volume24Change: "+7.23%",
    totalVolume: "2,134 TEA",
    totalVolumeChange: "-1.03%",
    owners: 2174,
    supply: 2222,
    avatar: "/assets/EtherealEntities.png",
  },
  {
    name: "Tea in The House",
    floor: "0.1 TEA",
    floorChange: "+37.23%",
    volume24: "11.24 TEA",
    volume24Change: "+7.23%",
    totalVolume: "102 TEA",
    totalVolumeChange: "-1.03%",
    owners: 512,
    supply: 1001,
    avatar: "/assets/rabbits.png",
  },
];

// Fungsi GET akan menangani permintaan GET ke /api/trending-collections
export async function GET() {
  // --- Ganti bagian ini dengan fetching data dari API nyata ---
  // Contoh fetching dari API eksternal:
  // const API_URL = 'https://api.example.com/trending-nfts';
  // try {
  //   const externalApiResponse = await fetch(API_URL, {
  //     // Jika API memerlukan otentikasi atau header khusus, tambahkan di sini
  //     headers: {
  //       'Authorization': `Bearer YOUR_API_KEY`,
  //       'Content-Type': 'application/json',
  //     },
  //     cache: 'no-store', // Penting untuk memastikan data selalu baru
  //   });

  //   if (!externalApiResponse.ok) {
  //     throw new Error(`Failed to fetch from external API: ${externalApiResponse.statusText}`);
  //   }

  //   const externalData = await externalApiResponse.json();
  //   // Lakukan transformasi data dari externalData agar sesuai dengan interface TrendingCollection
  //   const transformedData = externalData.map((item: any) => ({
  //     name: item.name,
  //     floor: `${item.floor_price} ETH`,
  //     floorChange: `${item.floor_price_change_24h > 0 ? '+' : ''}${item.floor_price_change_24h.toFixed(2)}%`,
  //     volume24: `${item.volume_24h} ETH`,
  //     volume24Change: `${item.volume_24h_change > 0 ? '+' : ''}${item.volume_24h_change.toFixed(2)}%`,
  //     totalVolume: `${item.total_volume} ETH`,
  //     totalVolumeChange: `${item.total_volume_change > 0 ? '+' : ''}${item.total_volume_change.toFixed(2)}%`,
  //     owners: item.owners_count,
  //     supply: item.supply_count,
  //     avatar: item.image_url,
  //   }));
  //   return NextResponse.json(transformedData);

  // } catch (error) {
  //   console.error("Error fetching data from external API:", error);
  //   return NextResponse.json({ message: "Failed to fetch trending collections." }, { status: 500 });
  // }
  // --- Akhir bagian penggantian ---

  // Untuk sementara, kirim data mock:
  return NextResponse.json(MOCK_TRENDING_COLLECTIONS);
}
