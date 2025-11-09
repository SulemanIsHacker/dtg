import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '100vw',
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Failed to load image</div>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <motion.img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
};
