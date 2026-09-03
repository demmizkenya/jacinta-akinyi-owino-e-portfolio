import React, { useState, useEffect } from 'react';
import { ImageOff, Loader2, RefreshCw } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackInitials?: string;
  fallbackCategory?: string;
  showRetry?: boolean;
}

/**
 * SafeImage Component
 * - Verifies image availability before and during rendering
 * - Eliminates broken image link icons across all browsers & devices
 * - Graceful fallback with Maseno ECDE pedagogical branding if image is unavailable
 * - Automated single retry on network blip
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackText,
  fallbackInitials = 'JO',
  fallbackCategory,
  showRetry = false,
  id,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  // Sync src changes from parent
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);

  // If no source is provided or source is empty string
  if (!currentSrc || currentSrc.trim() === '') {
    return (
      <div
        id={id ? `${id}-fallback-empty` : undefined}
        className={`flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 rounded-lg text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-xl bg-[#7A1C6D]/15 text-[#7A1C6D] dark:text-[#E8B4E0] flex items-center justify-center font-serif font-bold text-lg mb-2">
          {fallbackInitials}
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {fallbackText || alt || 'Photo Pending'}
        </span>
        {fallbackCategory && (
          <span className="text-[10px] text-slate-400 mt-0.5">{fallbackCategory}</span>
        )}
      </div>
    );
  }

  const handleImageError = () => {
    if (retryCount < 1) {
      // Single auto-retry with cache-busting timestamp
      setRetryCount((prev) => prev + 1);
      const separator = currentSrc.includes('?') ? '&' : '?';
      setCurrentSrc(`${src}${separator}_t=${Date.now()}`);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleManualRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    const separator = src.includes('?') ? '&' : '?';
    setCurrentSrc(`${src}${separator}_retry=${Date.now()}`);
  };

  if (hasError) {
    return (
      <div
        id={id ? `${id}-fallback-error` : undefined}
        className={`flex flex-col items-center justify-center p-4 bg-[#FAF7FB] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 rounded-lg text-center select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-lg bg-[#7A1C6D]/10 text-[#7A1C6D] dark:text-[#E8B4E0] flex items-center justify-center font-serif font-bold text-sm mb-1.5">
          {fallbackInitials}
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 max-w-[90%]">
          {fallbackText || alt || 'Verified Evidence'}
        </p>
        <span className="text-[10px] text-slate-400 mt-0.5">ECDE Field Attachment</span>
        {showRetry && (
          <button
            type="button"
            onClick={handleManualRetry}
            className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 text-[11px] font-medium text-[#7A1C6D] dark:text-[#E8B4E0] border border-slate-200 dark:border-zinc-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reload</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200/60 dark:bg-zinc-800/60 backdrop-blur-[2px] flex items-center justify-center z-10 animate-pulse">
          <Loader2 className="w-5 h-5 text-[#7A1C6D] animate-spin opacity-70" />
        </div>
      )}
      <img
        {...rest}
        id={id}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={handleImageError}
      />
    </div>
  );
};
