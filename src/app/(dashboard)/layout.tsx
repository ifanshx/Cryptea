"use client"

import Sidebar from "@/components/Sidebar";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./loading";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 relative">
      <Sidebar isOpen={isSidebarOpen} onHover={setIsSidebarOpen} />
      <div className="flex-1">
        <main className={`ml-[80px] transition-all duration-300 ${isSidebarOpen ? 'ml-[250px]' : ''}`}>
          <Header />
          <Suspense fallback={<Loading />}>
            <div className="max-w-7xl mx-auto">{children}</div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
