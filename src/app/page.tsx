"use client"

import FeaturedCollection from "@/components/FeaturedCollection";
import FooterHome from "@/components/FooterHome";
import HeaderHome from "@/components/HeaderHome";
import TopCollector from "@/components/TopCollector";
import { McLaren } from 'next/font/google'
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const mclaren = McLaren({ weight: "400", subsets: ["latin"] });

export default function Home() {
    useEffect(() => {
        // Trigger animations after initial render
        const timer = setTimeout(() => {
            document.querySelectorAll('.animate-on-load').forEach(el => {
                el.classList.add('opacity-100', 'translate-y-0');
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-cover bg-fixed bg-center transition-colors duration-300"
            style={{ backgroundImage: "url('/backgroundhome.png')" }}>
            <HeaderHome />

            <main className="relative flex flex-col items-center justify-center px-4 mb-12">
                <Image
                    src="/assets/imagegrup.png"
                    alt="Tea illustration"
                    width={1000}
                    height={1000}
                    className="bg-cover mt-5 bg-fixed bg-center animate-on-load 
                     animate-float     opacity-0 translate-y-6 transition-all duration-700 ease-out"
                />

                <h1 className={`${mclaren.className} mt-10 mb-1 text-white text-center text-3xl md:text-5xl lg:text-5xl font-extrabold leading-[1.2] md:leading-tight
                           animate-on-load opacity-0 translate-y-6 transition-all duration-700 ease-out delay-150`}>
                    While you grinding<br />don’t forget to have a tea.
                </h1>

                <a
                    href="https://en.wikipedia.org/wiki/Tea"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${mclaren.className} text-base text-white lg:text-lg
                           animate-on-load opacity-0 translate-y-6 transition-all duration-700 ease-out delay-300
                           hover:text-primary-dark hover:scale-105 transition-transform`}
                >
                    Read the benefits of tea on Wikipedia
                </a>

                <Link
                    href="/home"
                    className="rounded-full mt-8 bg-white px-5 py-2 lg:px-6 lg:py-2.5 text-sm lg:text-base font-semibold text-primary shadow-md
                           animate-on-load opacity-0 translate-y-6 transition-all duration-700 ease-out delay-500
                           hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-transform"
                >
                    Go To APP
                </Link>
            </main>

            <FeaturedCollection />
            <TopCollector />
            <FooterHome />
        </div>
    );
}