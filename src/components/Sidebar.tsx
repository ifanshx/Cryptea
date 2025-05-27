'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  // ArrowLeftRight,
  // Image,
  // Rainbow,
  LeafIcon,
  PartyPopper,
  RocketIcon,
} from 'lucide-react';

const SIDEBAR_OPEN_WIDTH = 'w-64';   // 16rem
const SIDEBAR_CLOSED_WIDTH = 'w-20'; // 5rem

const NAV_ITEMS = [
  { name: 'Home', path: '/home', icon: RocketIcon },
  { name: 'Stake', path: '/stake', icon: LeafIcon },
  // { name: 'Generate', path: '/generate', icon: Rainbow },
  { name: 'Raffle', path: '/raffle', icon: PartyPopper },
  // { name: 'Gallery', path: '/gallery', icon: Image },
];

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

  const handleLinkClick = () => {
    if (isMobile) onClose();
  };

  return (
    <>
      {/* Overlay untuk Mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          // onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          isMobile
            ? (isOpen ? 'translate-x-0' : '-translate-x-full')
            : 'translate-x-0',
          isMobile
            ? SIDEBAR_OPEN_WIDTH
            : (isOpen ? SIDEBAR_OPEN_WIDTH : SIDEBAR_CLOSED_WIDTH)
        )}
        onMouseEnter={() => !isMobile && onHover(true)}
        onMouseLeave={() => !isMobile && onHover(false)}
      >
        {/* Logo */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg p-2 text-green-600">🌱</div>
            {((!isMobile && isOpen) || isMobile) && (
              <span className="text-xl font-bold text-gray-800">
                Cryptea
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2" role="menu">
          {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
            const isActive = pathname === path;
            const baseClasses = 'flex items-center p-3 rounded-lg transition-colors';
            return (
              <Link
                key={path}
                href={path}
                onClick={handleLinkClick}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  baseClasses,
                  isActive
                    ? 'bg-gray-100 font-semibold'
                    : 'hover:bg-gray-50 focus:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-teal-500'
                )}
              >
                <div className="relative group">
                  <Icon className="h-6 w-6 text-gray-600" aria-hidden="true" />
                  {/* Tooltip */}
                  {!isOpen && !isMobile && (
                    <span className="
                      absolute left-full top-1/2 -translate-y-1/2
                      ml-2 whitespace-nowrap rounded px-2 py-1 text-sm
                      bg-gray-800 text-white opacity-0
                      group-hover:opacity-100 transition-opacity
                      pointer-events-none
                    ">
                      {name}
                    </span>
                  )}
                </div>
                {((!isMobile && isOpen) || isMobile) && (
                  <span className="ml-3">{name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
