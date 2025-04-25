"use client";

import { useRouter } from "next/navigation";

import { HomeIcon, ArrowLeftIcon } from 'lucide-react';


export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg text-center space-y-6">
        {/* Animated 404 Unicorn */}
        <div className="text-9xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl animate-bounce">
            🦄
          </div>
          404
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-800">
            Oops! Magical Mishap!
          </h2>
          <p className="text-gray-600 text-lg">
            The page you&apos;re looking for has vanished into the digital
            void...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-pink-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Safety</span>
          </button>

          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-purple-200"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Home Portal</span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-pink-300 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
