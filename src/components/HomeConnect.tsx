import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react'

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
                const ready = mounted && authenticationStatus !== 'loading';
                const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        type="button"
                                        className="rounded-full bg-white px-5 py-2 lg:px-6 lg:py-2.5 text-sm lg:text-base font-semibold text-primary shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-600 transition-all duration-300 active:scale-95"
                                    >
                                        Wrong Network
                                    </button>
                                );
                            }

                            return (
                                <div className="flex items-center gap-3">


                                    <button
                                        onClick={openAccountModal}
                                        type="button"
                                        className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-primary shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                                    >
                                        {account.displayName}

                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    )
}

export default HomeConnect