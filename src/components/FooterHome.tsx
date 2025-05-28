// components/FooterHome.jsx
import Link from "next/link";
import React from "react";

const FooterHome = () => {
  const footerLinks = [
    { name: "Github", href: "https://github.com/your-repo" },
    { name: "Whitepaper", href: "/whitepaper" },
    { name: "Support", href: "/support" },
    { name: "Twitter", href: "https://twitter.com/your-handle" },
    // Anda bisa tambahkan lebih banyak link di sini, contoh:
    // { name: "Blog", href: "/blog" },
  ];

  return (
    <footer className="w-full absolute bottom-0 h-16 flex items-center justify-center z-10 px-2 md:px-0"> {/* Tambahkan padding horizontal untuk mobile */}
      <div className="w-full max-w-screen-xl mx-auto rounded-full bg-white/20 backdrop-blur-lg border border-white/10 p-2">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-white/80 py-1"> {/* Gunakan flex-wrap dan gap-x/gap-y */}
            {footerLinks.map((link, index) => (
              <React.Fragment key={link.name}>
                <li>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors whitespace-nowrap" // Sesuaikan ukuran font untuk mobile, tambahkan whitespace-nowrap
                    target={link.href.startsWith('http') ? "_blank" : undefined}
                    rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                  >
                    {link.name}
                  </Link>
                </li>
                {/* Tampilkan pemisah hanya jika bukan link terakhir dan di layar kecil,
                    atau selalu tampilkan di layar lebih besar (md:block) */}
                {index < footerLinks.length - 1 && (
                  <span className="text-white/30 hidden sm:inline-block" aria-hidden="true">|</span> // Sembunyikan pemisah di layar sangat kecil, tampilkan di sm: dan atas
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default FooterHome;