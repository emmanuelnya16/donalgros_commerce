import React from 'react';

/**
 * LazyImage — an image component with:
 *  • native loading="lazy" for below-the-fold images
 *  • IntersectionObserver-based reveal with fade-in
 *  • Optional shimmer placeholder while loading
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Set to true for above-the-fold hero images (disables lazy) */
  eager?: boolean;
  /** Wrapper className override */
  wrapperClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  eager = false,
  style,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(eager);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (eager || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading 200px before visible
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={style}
    >
      {/* Shimmer placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:2000px_100%]" />
      )}

      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          {...rest}
        />
      )}
    </div>
  );
};

/**
 * PageLoader — a beautiful loading spinner for React.lazy Suspense fallbacks
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
    <div className="relative">
      {/* Outer ring */}
      <div className="w-16 h-16 rounded-full border-4 border-light-gray" />
      {/* Spinning gradient ring */}
      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-blue border-r-primary-green animate-spin" />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-primary-blue rounded-full animate-pulse" />
      </div>
    </div>
    {message && (
      <p className="text-sm text-medium-gray font-medium tracking-wide uppercase animate-pulse">
        {message}
      </p>
    )}
  </div>
);

/**
 * SkeletonCard — placeholder skeleton for product cards during load
 */
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-light-gray overflow-hidden animate-pulse">
    <div className="h-[280px] bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="flex justify-between items-center pt-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-10 w-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

/**
 * SkeletonGrid — a grid of skeleton cards
 */
export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16">
    <div className="flex flex-col items-center mb-12 space-y-3">
      <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
      <div className="h-4 bg-gray-100 rounded w-96 animate-pulse" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);
/**
 * SkeletonSection — Skeleton for a horizontal product grid section (home page)
 */
export const SkeletonSection: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 md:py-16">
    {/* Header */}
    <div className="flex items-end justify-between mb-6 md:mb-8 border-b border-gray-100 pb-4">
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-48 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-72 animate-pulse" />
      </div>
      <div className="hidden md:flex items-center">
        <div className="w-24 h-5 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
    {/* Responsive Grid layout to match ProductSection */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </section>
);

/**
 * SkeletonCategoryRow — Skeleton for the category grid / chips row
 */
export const SkeletonCategoryRow: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-2xl animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  </div>
);

/**
 * BackgroundRefreshBadge — Shows a subtle indicator when data is being refreshed in the background
 */
export const BackgroundRefreshBadge: React.FC = () => (
  <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg rounded-full px-3 py-1.5 text-xs text-gray-500 font-medium">
    <svg className="w-3 h-3 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
    Mise à jour...
  </div>
);
