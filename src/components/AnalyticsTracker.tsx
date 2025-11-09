
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    clarity: (command: string, ...args: any[]) => void;
  }
}

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views with Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-QM3LP0Q62H', {
        page_path: location.pathname + location.search,
      });
      
      // Send a page_view event
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
      
      console.log('GA4 page view tracked:', location.pathname);
    }

    // Track page context with Clarity (if available)
    if (typeof window.clarity !== 'undefined') {
      // Set custom tags for better segmentation
      const isProductPage = location.pathname.startsWith('/product/');
      const productSlug = isProductPage ? location.pathname.split('/product/')[1] : null;
      
      if (isProductPage && productSlug) {
        window.clarity('set', 'page_type', 'product');
        window.clarity('set', 'product_slug', productSlug);
        console.log('Clarity product page tracked:', productSlug);
      } else {
        window.clarity('set', 'page_type', location.pathname === '/' ? 'home' : location.pathname.slice(1));
      }
    }
  }, [location]);

  // This component doesn't render anything
  return null;
};
