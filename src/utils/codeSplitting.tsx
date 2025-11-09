import React, { lazy, ComponentType, Suspense, useState, useCallback } from "react";

// Higher-order component for code splitting with error boundary
export const withCodeSplitting = <P extends any>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ComponentType<P>
) => {
  const LazyComponent = lazy(importFunc);

  return (props: P) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </ErrorBoundary>
    );
  };
};

// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: ComponentType<any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Code splitting error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-white mb-6">
              Failed to load component. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return () => {
    importFunc();
  };
};

// Route-based code splitting
export const createLazyRoute = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return lazy(importFunc);
};

// Component-based code splitting with loading state
export const createLazyComponent = <P extends any>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);

  return (props: P) => {
    const DefaultLoading = () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

    return (
      <ErrorBoundary>
        <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <DefaultLoading />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </ErrorBoundary>
    );
  };
};

// Utility for preloading components on hover/focus
export const usePreloadOnHover = (importFunc: () => Promise<any>) => {
  const [preloaded, setPreloaded] = useState(false);

  const preload = useCallback(() => {
    if (!preloaded) {
      importFunc().then(() => {
        setPreloaded(true);
      });
    }
  }, [importFunc, preloaded]);

  return {
    onMouseEnter: preload,
    onFocus: preload,
    preloaded
  };
};

// Bundle analyzer helper (development only)
export const analyzeBundle = () => {
  if (import.meta.env.DEV) {
    // This would integrate with webpack-bundle-analyzer or similar
    console.log('Bundle analysis available in development mode');
  }
};

// Performance monitoring for code splitting
export const measureComponentLoad = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    if (import.meta.env.DEV) {
      console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (window.gtag) {
      window.gtag('event', 'component_load_time', {
        component_name: componentName,
        load_time: loadTime
      });
    }
  };
};
