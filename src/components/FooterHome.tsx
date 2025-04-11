import Link from 'next/link'
import React from 'react'

const FooterHome = () => {
    return (
        <footer className="relative bottom-3  max-w-full mx-15     ">
            <div className="container  mx-auto flex flex-col rounded-full bg-white/20 backdrop-blur-md  backdrop-opacity-65 items-center justify-between px-6 py-8 md:flex-row">
                <span className="mb-4 md:mb-0">◎ Cryptea 2025 🌱</span>
                <div className="flex gap-6">
                    <Link href="#" className="text-primary hover:text-primary-dark">Github</Link>
                    <Link href="#" className="text-primary hover:text-primary-dark">Whitepaper</Link>
                    <Link href="#" className="text-primary hover:text-primary-dark">Support</Link>
                    <Link href="#" className="text-primary hover:text-primary-dark">Twitter</Link>
                </div>
            </div>

        </footer>
    )
}

export default FooterHome