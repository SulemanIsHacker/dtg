import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  onError?: () => void;
  onClick?: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className = "",
  loading = "lazy",
  priority = false,
  onError,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === "eager") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (onError) {
      onError();
    }
  };

  // Generate WebP src if possible
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return '/placeholder.svg';
    
    // If it's already a placeholder or external URL, return as is
    if (originalSrc.includes('placeholder.svg') || originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    // For local images, we could potentially convert to WebP
    // For now, return the original src
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);
  const fallbackSrc = hasError ? '/placeholder.svg' : optimizedSrc;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Placeholder */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          src={fallbackSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading={priority ? "eager" : loading}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            // Prevent layout shift
            aspectRatio: 'auto',
          }}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};
