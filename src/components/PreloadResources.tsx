import { useEffect } from 'react';

export const PreloadResources = () => {
  useEffect(() => {
    // Only preload resources that are actually used
    const preloadCriticalResources = () => {
      // Preload only the most critical image that's used on every page
      const criticalImage = '/dtg.jpeg';
      
      // Check if already preloaded
      const existingPreload = document.querySelector(`link[href="${criticalImage}"]`);
      if (!existingPreload) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = criticalImage;
        document.head.appendChild(link);
      }
    };

    // Use requestIdleCallback to avoid blocking the main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadCriticalResources, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(preloadCriticalResources, 100);
    }
  }, []);

  return null;
};
