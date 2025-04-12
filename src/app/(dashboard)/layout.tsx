// src/app/(dashboard)/layout.tsx

import Sidebar from "@/components/Sidebar";
import ConnectWallet from "@/components/ConnectWallet"; // boleh kamu aktifkan kembali
import React, { Suspense } from "react";
import Loading from "./loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 relative">
      <Sidebar />
      <ConnectWallet />
      <main className="md:ml-64 p-6 lg:p-8 py-20">
        {" "}
        <Suspense fallback={<Loading />}>
          <div className="max-w-7xl mx-auto">{children}</div>
        </Suspense>
      </main>
    </div>
  );
}
