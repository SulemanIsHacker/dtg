import { useEffect } from 'react';

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const monitorPerformance = () => {
      const observers: PerformanceObserver[] = [];
      
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (import.meta.env.DEV) {
            console.log('LCP:', lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        observers.push(lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (import.meta.env.DEV) {
              console.log('FID:', entry.processingStart - entry.startTime);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        observers.push(fidObserver);

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          if (import.meta.env.DEV) {
            console.log('CLS:', clsValue);
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        observers.push(clsObserver);
      }

      // Monitor resource loading times
      const handleLoad = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (import.meta.env.DEV) {
          console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
          console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          console.log('First Byte:', navigation.responseStart - navigation.fetchStart);
        }
      };
      
      window.addEventListener('load', handleLoad);

      // Return cleanup function
      return () => {
        observers.forEach(observer => observer.disconnect());
        window.removeEventListener('load', handleLoad);
      };
    };

    // Only monitor in development
    if (process.env.NODE_ENV === 'development') {
      const cleanup = monitorPerformance();
      return cleanup;
    }
  }, []);

  return null;
};
