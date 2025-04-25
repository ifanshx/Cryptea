"use client";

import {
  Bell,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { useEffect, useState, useRef, CSSProperties } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number; // Duration in milliseconds before auto-close
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 4000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Calculate update interval (e.g., update every 50ms)
  const updateInterval = 50;
  const decrement = (updateInterval / duration) * 100;

  // Manage progress bar and auto-dismiss
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev - decrement;
          if (next <= 0) {
            clearInterval(intervalRef.current!);
            setIsVisible(false);
            // Wait for exit animation to finish before closing
            setTimeout(() => {
              onClose();
            }, 300);
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
  }, [isPaused, decrement, updateInterval, onClose]);

  // Toast type styles
  const typeStyles: Record<"success" | "error" | "warning" | "info", string> = {
    success: "bg-green-500 text-white border-green-700",
    error: "bg-red-500 text-white border-red-700",
    warning: "bg-yellow-500 text-black border-yellow-700",
    info: "bg-blue-500 text-white border-blue-700",
  };

  // Icons for each toast type
  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <X className="w-6 h-6" />,
    warning: <Bell className="w-6 h-6" />,
    info: <AlertCircle className="w-6 h-6" />,
  };



  // Styles for the progress bar
  const progressBarStyle: CSSProperties = {
    width: `${progress}%`,
  };

  // Determine animation class based on visibility
  const animationClass = isVisible
    ? "animate-fadeInSlideDown"
    : "animate-fadeOutSlideUp";

  return (
    <>
      <div
        className={`fixed top-4 right-4 z-50 ${animationClass}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`${typeStyles[type]} relative flex flex-col overflow-hidden items-center gap-3 p-4 rounded-lg shadow-xl min-w-[320px] border-2 transition-transform duration-300 transform hover:scale-105`}
        >
          <div className="flex items-center gap-3 w-full">
            {icons[type]}
            <span className="font-semibold text-sm flex-1">{message}</span>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  onClose();
                }, 300);
              }}
              className="hover:opacity-75 transition-opacity"
              aria-label="Close toast"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
            <div
              className="h-full bg-white transition-all duration-50"
              style={progressBarStyle}
            />
          </div>
        </div>
      </div>

      {/* Custom Keyframe Animations */}
      <style jsx>{`
        @keyframes fadeInSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOutSlideUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
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
