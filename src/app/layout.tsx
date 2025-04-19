import { Providers } from "./providers";
import type { Metadata } from "next";
import { McLaren } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const mclaren = McLaren({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cryptea",
  description: "Cryptea Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={mclaren.className}>
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
