// Security utilities for the application
import { createRateLimiter } from './validation';

// Rate limiters for different operations
export const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = createRateLimiter(100, 60 * 1000); // 100 requests per minute
export const checkoutRateLimiter = createRateLimiter(10, 60 * 1000); // 10 checkouts per minute

// Security headers for API responses
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
});

// Content Security Policy
export const getCSPHeader = () => 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https: blob:; " +
  "connect-src 'self' https://amqcsdlrvuxvbvatbutz.supabase.co https://www.google-analytics.com; " +
  "frame-src 'self' https://www.youtube.com; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self';";

// Secure storage utilities
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      // Only store non-sensitive data in localStorage
      if (key.includes('password') || key.includes('token') || key.includes('key')) {
        console.warn('Attempted to store sensitive data in localStorage');
        return;
      }
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

// Input sanitization for different contexts
export const sanitizeInput = {
  // For display in HTML
  html: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // For URLs
  url: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    try {
      const url = new URL(input);
      return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
    } catch {
      return '';
    }
  },

  // For file names
  filename: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }
};

// Security validation helpers
export const securityValidation = {
  // Check if user agent is suspicious
  isSuspiciousUserAgent: (userAgent: string): boolean => {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i
    ];
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  },

  // Check if IP is from known VPN/proxy
  isVPNOrProxy: (ip: string): boolean => {
    // This would typically check against a VPN/proxy database
    // For now, just return false
    return false;
  },

  // Validate request origin
  isValidOrigin: (origin: string, allowedOrigins: string[]): boolean => {
    return allowedOrigins.includes(origin);
  }
};

// Error handling with security considerations
export const secureErrorHandler = (error: any, context: string): string => {
  // Log error for monitoring
  console.error(`Security error in ${context}:`, error);

  // Don't expose sensitive error details to client
  if (error.message?.includes('password') || 
      error.message?.includes('token') || 
      error.message?.includes('key')) {
    return 'An authentication error occurred. Please try again.';
  }

  // Generic error message for security
  return 'An error occurred. Please try again.';
};

// Session security
export const sessionSecurity = {
  // Generate secure session ID
  generateSessionId: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Check session validity
  isValidSession: (sessionId: string): boolean => {
    return sessionId && sessionId.length === 64 && /^[a-f0-9]+$/.test(sessionId);
  },

  // Session timeout (24 hours)
  isSessionExpired: (timestamp: number): boolean => {
    const now = Date.now();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    return (now - timestamp) > sessionDuration;
  }
};

// API security middleware
export const apiSecurity = {
  // Validate API request
  validateRequest: (req: any): { valid: boolean; error?: string } => {
    // Check rate limiting
    const clientId = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    if (!apiRateLimiter(clientId)) {
      return { valid: false, error: 'Rate limit exceeded' };
    }

    // Check user agent
    const userAgent = req.headers['user-agent'] || '';
    if (securityValidation.isSuspiciousUserAgent(userAgent)) {
      return { valid: false, error: 'Invalid request' };
    }

    return { valid: true };
  },

  // Add security headers to response
  addSecurityHeaders: (res: any): void => {
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.setHeader('Content-Security-Policy', getCSPHeader());
  }
};

// Export all security utilities
export default {
  rateLimiters: {
    login: loginRateLimiter,
    api: apiRateLimiter,
    checkout: checkoutRateLimiter
  },
  headers: getSecurityHeaders,
  csp: getCSPHeader,
  storage: secureStorage,
  sanitize: sanitizeInput,
  validation: securityValidation,
  errorHandler: secureErrorHandler,
  session: sessionSecurity,
  api: apiSecurity
};
