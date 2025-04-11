"use client";

import { useState, useEffect } from "react";
import {
  HomeIcon,
  LockClosedIcon,
  PhotoIcon,
  SparklesIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Tutup sidebar saat navigasi
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Home", path: "/home", icon: HomeIcon },
    { name: "Stake", path: "/stake", icon: LockClosedIcon },
    { name: "Generate", path: "/generate", icon: SparklesIcon },
    { name: "Zephyrus", path: "/zephyrus", icon: SparklesIcon },
    { name: "Gallery", path: "/gallery", icon: PhotoIcon },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-3 left-4 z-[100] p-2 bg-white rounded-xl shadow-lg transition-all ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
      >
        <Bars3Icon className="w-7 h-7 text-purple-600" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-xl p-6 transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-[100]`}
      >
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center"><Link href="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Ethereal Entities
            </span></Link>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="w-8 h-8 text-gray-600" />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300
        transform hover:scale-105 ${pathname === item.path
                  ? "bg-purple-100 text-purple-600 shadow-inner"
                  : "hover:bg-purple-50 text-gray-600"
                }`}
            >
              <item.icon className="w-6 h-6 transition-transform hover:rotate-12" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
