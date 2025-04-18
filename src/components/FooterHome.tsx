import Link from 'next/link'
import React from 'react'

const FooterHome = () => {
    return (
        <footer className="w-full absolute bottom-0 h-16 flex items-center justify-center">
            <div className="max-w-full mx-auto rounded-full bg-white/20 backdrop-blur-lg border border-white/10">
                <div className="flex items-center justify-center space-x-4 text-white/80 py-3 px-72">
                    <Link
                        href="#"
                        className="text-sm hover:text-white transition-colors"
                    >
                        Github
                    </Link>
                    <span className="text-white/30">|</span>
                    <Link
                        href="#"
                        className="text-sm hover:text-white transition-colors"
                    >
                        Whitepaper
                    </Link>
                    <span className="text-white/30">|</span>
                    <Link
                        href="#"
                        className="text-sm hover:text-white transition-colors"
                    >
                        Support
                    </Link>
                    <span className="text-white/30">|</span>
                    <Link
                        href="#"
                        className="text-sm hover:text-white transition-colors"
                    >
                        Twitter
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default FooterHome