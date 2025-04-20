// components/Loading.tsx

export default function LoadingSekleton() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
    >
      <div className="text-center space-y-6">

        {/* Dual Ring Spinner */}
        <div className="relative inline-block">
          <div className="w-14 h-14 border-4 border-black rounded-full absolute"></div>
          <div className="w-14 h-14 border-4 border-black border-t-transparent rounded-full animate-spin-slow"></div>
        </div>

        {/* Animated Text */}
        <div className="space-y-2">
          <p className="text-black font-medium text-lg animate-pulse">
            Preparing Magic...
          </p>
          <p className="text-sm text-black ">
            Just a moment with our entities...
          </p>
        </div>
      </div>
    </div>
  );
}
