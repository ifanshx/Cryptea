// components/HomeConnect.tsx
"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const HomeConnect = () => {
  return (
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
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-1 text-gray-900 hover:text-gray-700 font-medium text-sm"
              >
                Connect Wallet
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Wrong Network
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={openAccountModal}
                className="flex items-center gap-1 text-gray-900 hover:text-gray-700 font-medium text-sm"
              >
                {account.displayName}
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default HomeConnect;
