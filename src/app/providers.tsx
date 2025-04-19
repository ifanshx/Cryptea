"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { defineChain } from "viem";

export const TeaChain = defineChain({
  id: 10218,
  name: "Tea Sepolia Testnet",
  nativeCurrency: { name: "Tea Sepolia Testnet", symbol: "TEA", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://tea-sepolia.g.alchemy.com/public",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Tea Sepolia Testnet", url: "https://sepolia.tea.xyz" },
  },
  iconUrl: "/tea.svg",
  contracts: {},
});

const config = getDefaultConfig({
  appName: "Ethereal Entities",
  projectId: "438077850ac125b34cddf29c451af227",
  chains: [TeaChain],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode
          showRecentTransactions={true}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
