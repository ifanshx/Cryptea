// components/LoadingSpinner.tsx
import { clsx } from 'clsx'; // Import clsx for conditional classes

type LoadingSpinnerProps = {
  /**
   * Ukuran spinner (misal: 'sm', 'md', 'lg').
   * Default: 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Warna spinner.
   * Default: 'text-teal-500' (sesuai tema Cryptea)
   */
  color?: string;
  /**
   * Pesan teks utama yang ditampilkan.
   * Default: 'Preparing Magic...'
   */
  message?: string;
  /**
   * Pesan sub-teks.
   * Default: 'Just a moment with our entities...'
   */
  subMessage?: string;
  /**
   * Apakah background full screen atau tidak.
   * Default: true
   */
  fullScreen?: boolean;
};

export default function LoadingSpinner({
  size = 'md',
  color = 'text-teal-500', // Menggunakan warna tema Cryptea
  message = 'Preparing Magic...',
  subMessage = 'Just a moment with our entities...',
  fullScreen = true,
}: LoadingSpinnerProps) {
  // Menyesuaikan ukuran berdasarkan prop 'size'
  const spinnerSizeClasses = {
    sm: 'w-8 h-8 border-3',
    md: 'w-14 h-14 border-4',
    lg: 'w-20 h-20 border-5',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const subTextSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-center font-sans dark:bg-gray-900", // Tambah dark mode background
        fullScreen ? "min-h-screen" : "min-h-[200px]" // Fleksibilitas full screen
      )}
    >
      <div className="text-center space-y-6 p-4">
        {/* Modern Spinner */}
        <div className="relative inline-block">
          <div
            className={clsx(
              "rounded-full absolute border-solid border-current border-opacity-20",
              spinnerSizeClasses[size],
              color // Warna border transparan
            )}
            style={{ borderColor: `currentColor transparent transparent transparent` }} // Gaya border untuk efek modern
          ></div>
          <div
            className={clsx(
              "rounded-full animate-spin", // Pastikan ini adalah animasi spin standar (putar searah jarum jam)
              spinnerSizeClasses[size],
              color // Warna border solid
            )}
            style={{ borderTopColor: 'currentColor', borderRightColor: 'currentColor', borderBottomColor: 'currentColor', borderLeftColor: 'transparent' }} // Efek loader
          ></div>
        </div>

        {/* Animated Text */}
        <div className="space-y-2">
          <p
            className={clsx(
              "font-medium animate-pulse text-gray-300 dark:text-gray-200", // Warna teks dan dark mode
              textSizeClasses[size]
            )}
          >
            {message}
          </p>
          <p
            className={clsx(
              "text-gray-300 dark:text-gray-400", // Warna teks dan dark mode
              subTextSizeClasses[size]
            )}
          >
            {subMessage}
          </p>
        </div>
      </div>
    </div>
  );
}