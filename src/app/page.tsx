"use client"

import FooterHome from "@/components/FooterHome";
import { McLaren } from 'next/font/google'
import Link from "next/link";
import { useEffect } from "react";

const mclaren = McLaren({ weight: "400", subsets: ["latin"] });

export default function Home() {
    useEffect(() => {
        const timer = setTimeout(() => {
            document.querySelectorAll('.animate-on-load').forEach(el => {
                el.classList.add('opacity-100', 'translate-y-0');
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative h-screen overflow-hidden min-h-screen bg-cover bg-fixed bg-center transition-colors duration-300"
            style={{ backgroundImage: "url('/backgroundhome.png')" }}>

            {/* Header Section */}
            <div className="flex flex-col items-center pt-15 px-4 gap-3  ">
                <h1 className={`${mclaren.className} text-white text-center text-2xl font-extrabold
                        animate-on-load opacity-0 translate-y-2 transition-all duration-700 ease-out delay-150`}>
                    🌱 CRYPTEA
                </h1>

                <h2 className={`${mclaren.className} text-white text-center text-5xl font-extrabold
                        animate-on-load opacity-0 translate-y-4 transition-all duration-700 ease-out delay-300`}>
                    All you need is a Tea.
                </h2>

                <a
                    href="https://en.wikipedia.org/wiki/Tea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${mclaren.className} text-lg text-white/80 hover:text-white text-center
                            animate-on-load opacity-0 translate-y-6 transition-all duration-700 ease-out delay-500
                            hover:underline transition-transform`}
                >
                    Read the benefits of tea on Wikipedia
                </a>
            </div>

            {/* Enter Button */}
            <div className="flex flex-col items-center justify-center pt-42 px-4 ">
                <Link
                    href="/home"
                    className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-primary
                            animate-on-load opacity-0 translate-y-6 transition-all duration-700 ease-out delay-700
                            hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-transform"
                >
                    ENTER
                </Link>
            </div>

            <FooterHome />
        </div>
    );
}