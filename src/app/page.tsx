"use client";

import { McLaren } from "next/font/google";
import { useEffect, useState } from "react"; // Tambahkan useState
import Link from "next/link";
import FooterHome from "@/components/FooterHome";

const mclaren = McLaren({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Komponen TypewriterEffect yang baru
type TypewriterEffectProps = {
  text: string;
  className?: string;
  delay?: number;
};

const TypewriterEffect = ({ text, className, delay = 0 }: TypewriterEffectProps) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 70 + delay); // Kecepatan ketik (70ms per karakter) + delay

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return <span className={className}>{displayText}</span>;
};

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll(".animate-on-load").forEach((el) => {
        el.classList.add("opacity-100", "translate-y-0");
      });
      const backgroundEl = document.querySelector(".animate-background");
      if (backgroundEl) {
        backgroundEl.classList.add("opacity-100");
      }
      const footerEl = document.querySelector(".animate-footer");
      if (footerEl) {
        footerEl.classList.add("opacity-100");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat opacity-0 transition-opacity duration-1000 ease-in animate-background"
      style={{ backgroundImage: "url('/backgroundhome.png')" }}
    >
      <div className="mt-[55px] flex flex-grow flex-col items-center">
        <div className="flex flex-col items-center text-center">
          <h1
            className={`${mclaren.className} animate-on-load mb-4 text-xl md:text-3xl lg:text-4xl font-extrabold text-white opacity-0 transition-all duration-700 ease-out delay-150 translate-y-6`}
          >
            🌱 CRYPTEA
          </h1>

          <h2
            className={`${mclaren.className} animate-on-load mb-4 text-3xl md:text-5xl lg:text-6xl font-bold text-white opacity-0 transition-all duration-700 ease-out delay-300 translate-y-6`}
          >
            {/* Menggunakan komponen TypewriterEffect di sini */}
            <TypewriterEffect
              text="All you need is a "
              className="inline-block" // Tambahkan inline-block untuk menjaga spasi
              delay={0} // Delay awal jika diperlukan
            />{" "}
            <span className="text-green-300">
              <TypewriterEffect
                text="Tea."
                className="inline-block"
                delay={80 * "All you need is a ".length} // Sesuaikan delay agar 'Tea.' muncul setelah teks sebelumnya selesai diketik
              />
            </span>
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

        <Link
          href="/home"
          className={`${mclaren.className} animate-on-load mt-28 rounded-full bg-white px-12 py-4 text-lg font-semibold text-primary shadow-lg opacity-0 transition-all duration-700 ease-out delay-700 translate-y-6 
          hover:shadow-xl hover:scale-105 hover:animate-bounce`}
        >
          ENTER
        </Link>
      </div>

      <div className="opacity-0 transition-opacity duration-1000 ease-in delay-700 animate-footer">
        <FooterHome />
      </div>
    </div>
  );
}