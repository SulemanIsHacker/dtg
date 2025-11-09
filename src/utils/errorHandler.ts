import React from 'react';
import { toast } from '@/hooks/use-toast';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
}

export interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  context?: ErrorContext;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly context?: ErrorContext;
  public readonly timestamp: Date;

  constructor(message: string, details?: Partial<ErrorDetails>) {
    super(message);
    this.name = 'AppError';
    this.code = details?.code;
    this.status = details?.status;
    this.context = details?.context;
    this.timestamp = new Date();
  }
}

export const ErrorHandler = {
  /**
   * Handle errors with proper logging and user feedback
   */
  handle: (error: unknown, context?: ErrorContext) => {
    const errorDetails = ErrorHandler.parseError(error);
    
    // Log error for debugging
    if (import.meta.env.DEV) {
      console.error('Error occurred:', {
        message: errorDetails.message,
        code: errorDetails.code,
        status: errorDetails.status,
        context,
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Show user-friendly error message
    ErrorHandler.showUserError(errorDetails, context);
    
    return errorDetails;
  },

  /**
   * Parse different types of errors into a consistent format
   */
  parseError: (error: unknown): ErrorDetails => {
    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        status: error.status,
        context: error.context
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR'
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR'
      };
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: (error as any).message || 'An unknown error occurred',
        code: (error as any).code || 'OBJECT_ERROR',
        status: (error as any).status
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  },

  /**
   * Show user-friendly error message
   */
  showUserError: (errorDetails: ErrorDetails, context?: ErrorContext) => {
    const { message, code, status } = errorDetails;
    
    // Determine error severity and user message
    let userMessage = message;
    let variant: "default" | "destructive" = "destructive";
    let title = "Error";

    // Handle specific error types
    switch (code) {
      case 'NETWORK_ERROR':
        userMessage = "Unable to connect to the server. Please check your internet connection.";
        title = "Connection Error";
        break;
      case 'VALIDATION_ERROR':
        userMessage = message;
        title = "Validation Error";
        break;
      case 'AUTH_ERROR':
        userMessage = "Authentication failed. Please log in again.";
        title = "Authentication Error";
        break;
      case 'PERMISSION_ERROR':
        userMessage = "You don't have permission to perform this action.";
        title = "Permission Denied";
        break;
      case 'NOT_FOUND':
        userMessage = "The requested resource was not found.";
        title = "Not Found";
        break;
      case 'SERVER_ERROR':
        userMessage = "A server error occurred. Please try again later.";
        title = "Server Error";
        break;
      default:
        if (status === 404) {
          userMessage = "The requested resource was not found.";
          title = "Not Found";
        } else if (status === 403) {
          userMessage = "You don't have permission to perform this action.";
          title = "Permission Denied";
        } else if (status === 401) {
          userMessage = "Authentication failed. Please log in again.";
          title = "Authentication Error";
        } else if (status && status >= 500) {
          userMessage = "A server error occurred. Please try again later.";
          title = "Server Error";
        } else if (status && status >= 400) {
          userMessage = message || "A client error occurred.";
          title = "Request Error";
        }
    }

    // Don't show toast for certain contexts to avoid spam
    if (context?.component === 'ErrorBoundary') {
      return;
    }

    toast({
      title,
      description: userMessage,
      variant
    });
  },

  /**
   * Create a standardized error for common scenarios
   */
  create: {
    networkError: (message = "Network error occurred") => 
      new AppError(message, { code: 'NETWORK_ERROR' }),
    
    validationError: (message: string) => 
      new AppError(message, { code: 'VALIDATION_ERROR' }),
    
    authError: (message = "Authentication failed") => 
      new AppError(message, { code: 'AUTH_ERROR' }),
    
    permissionError: (message = "Permission denied") => 
      new AppError(message, { code: 'PERMISSION_ERROR' }),
    
    notFound: (message = "Resource not found") => 
      new AppError(message, { code: 'NOT_FOUND', status: 404 }),
    
    serverError: (message = "Server error occurred") => 
      new AppError(message, { code: 'SERVER_ERROR', status: 500 })
  },

  /**
   * Wrap async functions with error handling
   */
  wrap: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: ErrorContext
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        ErrorHandler.handle(error, context);
        return null;
      }
    };
  },

  /**
   * Wrap sync functions with error handling
   */
  wrapSync: <T extends any[], R>(
    fn: (...args: T) => R,
    context?: ErrorContext
  ) => {
    return (...args: T): R | null => {
      try {
        return fn(...args);
      } catch (error) {
        ErrorHandler.handle(error, context);
        return null;
      }
    };
  }
};

/**
 * Higher-order component for error handling
 */
export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  context?: ErrorContext
) => {
  return (props: P) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      ErrorHandler.handle(error, context);
      return null;
    }
  };
};

/**
 * Hook for error handling in functional components
 */
export const useErrorHandler = (context?: ErrorContext) => {
  return {
    handle: (error: unknown) => ErrorHandler.handle(error, context),
    create: ErrorHandler.create,
    wrap: <T extends any[], R>(fn: (...args: T) => Promise<R>) => 
      ErrorHandler.wrap(fn, context),
    wrapSync: <T extends any[], R>(fn: (...args: T) => R) => 
      ErrorHandler.wrapSync(fn, context)
  };
};
