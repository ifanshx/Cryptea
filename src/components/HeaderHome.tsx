import Link from 'next/link'
import React from 'react'
import HomeConnect from './HomeConnect'

const HeaderHome = () => {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-xl md:text-2xl font-bold text-primary hover:text-primary-dark transition-colors">
                            Cryptea 🌱
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="flex items-center space-x-4 lg:space-x-5">
                        <button className="text-primary hover:text-primary-dark text-sm lg:text-base font-medium transition-all hover:-translate-y-[1px]">
                            Learn💡
                        </button>

                        {/* <button
                            className="rounded-full bg-white px-5 py-2 lg:px-6 lg:py-2.5 text-sm lg:text-base font-semibold text-primary shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
                        >
                            Connect Wallet
                        </button> */}
                        <HomeConnect />
                    </div>


                </div>
            </nav>
        </header>
    )
}

export default HeaderHome