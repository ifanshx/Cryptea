// components/Loading.tsx

export default function LoadingSekleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/backgroundhome.png')" }}
    >
      <div className="text-center space-y-6">
        {/* Animated Unicorn */}
        {/* <div className="text-6xl animate-float duration-1000 ease-in-out infinite">
          🦄
        </div> */}

        {/* Dual Ring Spinner */}
        <div className="relative inline-block">
          <div className="w-14 h-14 border-4 border-pink-200/50 rounded-full absolute"></div>
          <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin-slow"></div>
        </div>

        {/* Animated Text */}
        <div className="space-y-2">
          <p className="text-pink-600 font-medium text-lg animate-pulse">
            Preparing Magic...
          </p>
          <p className="text-sm text-pink-400/80">
            Just a moment with our entities...
          </p>
        </div>
      </div>
    </div>
  );
}
