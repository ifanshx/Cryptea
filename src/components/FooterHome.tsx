import Link from 'next/link'
import React from 'react'

const FooterHome = () => {
    return (
        <footer className="w-full mt-20 pb-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto rounded-full bg-white/20 backdrop-blur-lg border border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 md:py-6 gap-4 md:gap-0">
                    {/* Left Section */}
                    <span className="text-sm md:text-base text-center md:text-left">
                        ◎ Cryptea 2025 🌱
                    </span>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                        <Link
                            href="#"
                            className="text-sm md:text-base text-primary hover:text-primary-dark transition-colors px-2 py-1"
                        >
                            Github
                        </Link>
                        <Link
                            href="#"
                            className="text-sm md:text-base text-primary hover:text-primary-dark transition-colors px-2 py-1"
                        >
                            Whitepaper
                        </Link>
                        <Link
                            href="#"
                            className="text-sm md:text-base text-primary hover:text-primary-dark transition-colors px-2 py-1"
                        >
                            Support
                        </Link>
                        <Link
                            href="#"
                            className="text-sm md:text-base text-primary hover:text-primary-dark transition-colors px-2 py-1"
                        >
                            Twitter
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default FooterHome