// components/Sidebar.tsx
'use client'
import Link from 'next/link'
import {
  HomeIcon,
  LockClosedIcon,
  SparklesIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

const Items = [
  { name: "Home", path: "/home", icon: HomeIcon },
  { name: "Stake", path: "/stake", icon: LockClosedIcon },
  { name: "Generate", path: "/generate", icon: SparklesIcon },
  { name: "Zephyrus", path: "/zephyrus", icon: SparklesIcon },
  { name: "Gallery", path: "/gallery", icon: PhotoIcon },
];

export default function Sidebar({
  isOpen,
  onHover,
}: {
  isOpen: boolean
  onHover: (isOpen: boolean) => void
}) {
  return (
    <aside
      className={`fixed h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'
        }`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="p-4 space-y-2">
        <nav className="space-y-2">
          {Items.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors group"
            >
              <item.icon className="h-6 w-6 group-hover:text-blue-600" />
              {isOpen && (
                <span className="ml-3 font-medium group-hover:text-blue-600">
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}