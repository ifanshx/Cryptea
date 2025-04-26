"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

const ConnectWallet = () => {
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      className="group flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5
                        rounded-full shadow-lg transition-all duration-200
                        bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600"
                    >
                      <Wallet className="w-5 h-5 text-white" />
                      <span className="text-white font-medium text-sm md:text-base">
                        <span className="md:hidden">Connect</span>
                        <span className="hidden md:inline">Connect Wallet</span>
                      </span>
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full
                        text-sm md:text-base flex items-center gap-2"
                    >
                      <span>Wrong Network</span>
                    </button>
                  );
                }

                return (
                  <div className="flex gap-2">
                    <button
                      onClick={openChainModal}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5
                        rounded-full shadow-md flex items-center gap-2 text-sm"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 20, height: 20 }}
                            />
                          )}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={openAccountModal}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white px-4 py-2
                        rounded-full shadow-md flex items-center gap-2 group"
                    >
                      <Wallet className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-800 font-medium text-sm">
                        {account.displayName}
                      </span>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};

export default ConnectWallet;
