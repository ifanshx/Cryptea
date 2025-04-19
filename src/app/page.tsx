"use client";

import FooterHome from "@/components/FooterHome";
import { McLaren } from "next/font/google";
import { useEffect } from "react";
import Link from "next/link";

const mclaren = McLaren({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll(".animate-on-load").forEach((el) => {
        el.classList.add("opacity-100", "translate-y-0");
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/backgroundhome.png')" }}
    >
      {/* Main Content */}
      <div className="mt-[55px] flex flex-grow flex-col items-center">
        {/* Animated Text Sections */}
        <div className="flex flex-col items-center text-center ">
          <h1
            className={`${mclaren.className} animate-on-load mb-4 text-xl md:text-3xl lg:text-4xl  font-extrabold text-white opacity-0 transition-all duration-700 ease-out delay-150 translate-y-6 `}
          >
            🌱 CRYPTEA
          </h1>

          <h2
            className={`${mclaren.className} animate-on-load mb-4 text-3xl md:text-5xl lg:text-6xl font-bold text-white opacity-0 transition-all duration-700 ease-out delay-300 translate-y-6`}
          >
            All you need is a <span className="text-green-300">Tea</span>.
          </h2>

          <p
            className={`${mclaren.className} animate-on-load text-base sm:text-lg text-white/80 opacity-0 transition-all duration-700 ease-out delay-500 translate-y-6 hover:text-white`}
          >
            Read the benefits of tea on{" "}
            <Link
              href="https://en.wikipedia.org/wiki/Tea"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 underline hover:text-green-200"
            >
              Wikipedia
            </Link>
          </p>
        </div>

        {/* Animated Button */}
        <Link
          href="/home"
          className={`${mclaren.className} animate-on-load mt-28 rounded-full bg-white px-12 py-4 text-lg font-semibold text-primary shadow-lg opacity-0 transition-all duration-700 ease-out delay-700 translate-y-6 hover:shadow-xl  `}
        >
          ENTER
        </Link>
      </div>

      <FooterHome />
    </div>
  );
}
