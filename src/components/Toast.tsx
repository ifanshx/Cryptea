// components/ui/Toast.tsx (disarankan diletakkan di folder ui untuk reusabilitas)
"use client";

import {
  CheckCircle2, // Icon lebih modern untuk success
  AlertTriangle, // Icon lebih spesifik untuk warning
  Info, // Icon lebih spesifik untuk info
  XCircle, // Icon lebih spesifik untuk error
  X, // Icon untuk tombol close
} from 'lucide-react';
import { useEffect, useState, useRef } from "react";
import { clsx } from 'clsx'; // Untuk menggabungkan kelas Tailwind

export interface ToastProps {
  id: string; // ID unik untuk setiap toast
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // Durasi dalam milidetik sebelum auto-close
  onClose: (id: string) => void; // Perbarui agar menerima ID toast
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = "info",
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Interval untuk memperbarui progress bar
  const updateInterval = 50;
  const decrement = (updateInterval / duration) * 100;

  // Efek untuk mengelola progress bar dan auto-dismiss
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(intervalRef.current!);
            setIsVisible(false); // Mulai animasi keluar
            // Tunggu animasi keluar selesai sebelum memanggil onClose
            setTimeout(() => {
              onClose(id);
            }, 300); // Sesuaikan dengan durasi animasi fadeOutSlideUp
            return 0;
          }
          return next;
        });
      }, updateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, decrement, updateInterval, onClose, id]);

  // Toast type styles (termasuk dark mode)
  const typeStyles: Record<"success" | "error" | "warning" | "info", { bg: string; text: string; border: string; progressBg: string }> = {
    success: {
      bg: "bg-green-500 dark:bg-green-600",
      text: "text-white dark:text-white",
      border: "border-green-700 dark:border-green-800",
      progressBg: "bg-green-200 dark:bg-green-700",
    },
    error: {
      bg: "bg-red-500 dark:bg-red-600",
      text: "text-white dark:text-white",
      border: "border-red-700 dark:border-red-800",
      progressBg: "bg-red-200 dark:bg-red-700",
    },
    warning: {
      bg: "bg-yellow-500 dark:bg-yellow-600",
      text: "text-gray-900 dark:text-gray-50", // Teks hitam/putih untuk warning
      border: "border-yellow-700 dark:border-yellow-800",
      progressBg: "bg-yellow-200 dark:bg-yellow-700",
    },
    info: {
      bg: "bg-blue-500 dark:bg-blue-600",
      text: "text-white dark:text-white",
      border: "border-blue-700 dark:border-blue-800",
      progressBg: "bg-blue-200 dark:bg-blue-700",
    },
  };

  // Icons for each toast type
  const icons = {
    success: <CheckCircle2 className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
  };

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false); // Mulai animasi keluar
    clearInterval(intervalRef.current!); // Hentikan progress bar
    setTimeout(() => {
      onClose(id);
    }, 300); // Sesuaikan dengan durasi animasi fadeOutSlideUp
  };

  return (
    <>
      <div
        className={clsx(
          "relative flex flex-col overflow-hidden items-center gap-3 p-4 rounded-lg shadow-lg min-w-[320px] border-2 transition-transform transform",
          typeStyles[type].bg,
          typeStyles[type].text,
          typeStyles[type].border,
          isVisible ? "animate-fadeInSlideDown" : "animate-fadeOutSlideUp" // Animasi berdasarkan isVisible
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="alert" // Peran ARIA untuk notifikasi
        aria-live="assertive" // Memberi tahu pembaca layar untuk segera membacanya
      >
        <div className="flex items-center gap-3 w-full">
          {icons[type]}
          <span className="font-semibold text-sm flex-1 break-words">{message}</span> {/* break-words untuk pesan panjang */}
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-opacity-20 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current focus:ring-white" // Styling fokus lebih baik
            aria-label="Tutup notifikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Progress Bar */}
        <div className={clsx("absolute bottom-0 left-0 w-full h-1", typeStyles[type].progressBg)}>
          <div
            className="h-full bg-white transition-all duration-50 ease-linear" // Transition lebih linear
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Custom Keyframe Animations (bisa dipindah ke globals.css) */}
      <style jsx>{`
        @keyframes fadeInSlideDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeOutSlideUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        .animate-fadeInSlideDown {
          animation: fadeInSlideDown 0.3s ease-out forwards;
        }

        .animate-fadeOutSlideUp {
          animation: fadeOutSlideUp 0.3s ease-in forwards;
        }
      `}</style>
    </>
  );
};

export default Toast;