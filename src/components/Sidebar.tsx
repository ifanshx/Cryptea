'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LeafIcon, PartyPopper, RocketIcon } from 'lucide-react';

// Lebar sidebar dalam Tailwind CSS classes
const SIDEBAR_OPEN_WIDTH = 'w-64'; // 16rem
const SIDEBAR_CLOSED_WIDTH = 'w-20'; // 5rem

// Item navigasi dengan nama, path, dan ikon
const NAV_ITEMS = [
  { name: 'Home', path: '/home', icon: RocketIcon },
  { name: 'Stake', path: '/stake', icon: LeafIcon },
  { name: 'Raffle', path: '/raffle', icon: PartyPopper },
];

// Tipe props untuk komponen Sidebar
type SidebarProps = {
  isOpen: boolean;
  isMobile: boolean;
  onHover: (open: boolean) => void;
  onClose: () => void;
};

export default function Sidebar({
  isOpen,
  isMobile,
  onHover,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null); // Ref untuk sidebar

  // Menangani klik pada link navigasi (untuk menutup sidebar di mobile)
  const handleLinkClick = () => {
    if (isMobile) onClose();
  };

  // Menangani klik di luar sidebar untuk menutupnya di mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile, onClose]);

  return (
    <>
      {/* Overlay untuk Mobile saat sidebar terbuka */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden" // Hanya tampil di layar kecil
          onClick={onClose} // Menutup sidebar saat overlay diklik
          aria-hidden="true"
          aria-label="Tutup navigasi samping"
        />
      )}

      <aside
        ref={sidebarRef} // Pasang ref di sini
        aria-label="Main navigation"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out dark:bg-gray-800 dark:border-gray-700', // Tambah dark mode
          isMobile
            ? (isOpen ? 'translate-x-0' : '-translate-x-full') // Geser masuk/keluar di mobile
            : 'translate-x-0', // Selalu terlihat di desktop
          isMobile
            ? SIDEBAR_OPEN_WIDTH // Selalu lebar penuh di mobile saat terbuka
            : (isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH), // Lebar dinamis di desktop
        )}
        onMouseEnter={() => !isMobile && onHover(true)}
        onMouseLeave={() => !isMobile && onHover(false)}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg" // Tambah fokus styling
            aria-label={isOpen ? "Home Cryptea" : "Home"} // Label yang lebih deskriptif
          >
            <div className="rounded-lg p-2 text-green-600 bg-green-100 dark:bg-green-800">🌱</div>
            {((!isMobile && isOpen) || isMobile) && ( // Teks logo hanya muncul saat terbuka atau di mobile
              <span className="text-xl font-bold text-gray-800 dark:text-white truncate">
                Cryptea
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Main menu">
          {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                onClick={handleLinkClick}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'flex items-center p-3 rounded-lg transition-colors duration-200 ease-in-out group', // Tambah group untuk tooltip
                  isActive
                    ? 'bg-gray-100 font-semibold text-teal-600 dark:bg-gray-700 dark:text-teal-400' // Warna aktif
                    : 'text-gray-700 hover:bg-gray-50 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700', // Warna hover/fokus
                  'focus:outline-none focus:ring-2 focus:ring-teal-500', // Styling fokus
                  !isOpen && !isMobile && 'justify-center', // Rata tengah saat ikon saja
                )}
                title={!isOpen && !isMobile ? name : undefined} // Tooltip bawaan browser saat sidebar tertutup
              >
                <div className={clsx(
                  "flex-shrink-0", // Pastikan ikon tidak menyusut
                  isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400' // Warna ikon
                )}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                {((!isMobile && isOpen) || isMobile) && (
                  <span className="ml-3 whitespace-nowrap overflow-hidden text-ellipsis">
                    {name}
                  </span>
                )}
                {/* Custom Tooltip untuk desktop saat sidebar tertutup */}
                {!isOpen && !isMobile && (
                  <span className="
                    absolute left-full top-1/2 -translate-y-1/2
                    ml-4 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium
                    bg-gray-800 text-white opacity-0
                    group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200
                    pointer-events-none z-10 // Pastikan tooltip di atas konten lain
                  ">
                    {name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}