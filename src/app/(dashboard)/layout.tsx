// app/dashboard/layout.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Loading from "./loading";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white/40 flex">
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onHover={(open) => !isMobile && setSidebarOpen(open)}
        onClose={() => isMobile && setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Header
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
        />

        <main
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: isMobile ? 0 : sidebarOpen ? 250 : 80 }}
        >
          <Suspense fallback={<Loading />}>
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
