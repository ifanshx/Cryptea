// components/Sidebar.tsx
"use client";
import Link from "next/link";
import {
  HomeIcon,
  LockClosedIcon,
  SparklesIcon,
  // PhotoIcon,
} from "@heroicons/react/24/outline";

const Items = [
  { name: "Home", path: "/home", icon: HomeIcon },
  { name: "Stake", path: "/stake", icon: LockClosedIcon },
  { name: "Generate", path: "/generate", icon: SparklesIcon },
  // { name: "Zephyrus", path: "/zephyrus", icon: SparklesIcon },
  // { name: "Gallery", path: "/gallery", icon: PhotoIcon },
];

export default function Sidebar({
  isOpen,
  isMobile,
  onHover,
  onClose,
}: {
  isOpen: boolean;
  isMobile: boolean;
  onHover: (open: boolean) => void;
  onClose: () => void;
}) {
  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-30 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300
          ${isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
          }
          ${isMobile ? "w-64" : isOpen ? "w-64" : "w-20"}
        `}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            {/* Logo Icon */}
            <div className="bg-transparent  rounded-lg p-2">
              🌱
            </div>

            {/* Logo Text - Hidden when collapsed */}
            {((!isMobile && isOpen) || isMobile) && (
              <span className="text-xl font-bold text-gray-800">Cryptea</span>
            )}
          </Link>
        </div>

        <div className="p-4 space-y-4">
          <nav className="space-y-2">
            {Items.map((item, idx) => (
              <Link
                key={idx}
                href={item.path}
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-6 w-6 text-gray-600" />
                {((!isMobile && isOpen) || isMobile) && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}