
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to external service in production if needed
    if (import.meta.env.PROD) {
      console.error('Production error:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-white mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Go Home
              </button>
            </div>
            {this.state.error && import.meta.env.DEV && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-400">
                  Technical Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-gray-900 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.error.stack && '\n\nStack:\n' + this.state.error.stack}
                  {this.state.errorInfo?.componentStack && '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
