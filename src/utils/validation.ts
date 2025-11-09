
// Input validation and sanitization utilities
export const validateProductData = (data: any) => {
  const errors: string[] = [];

  // Required fields validation
  if (!data.name?.trim()) {
    errors.push('Product name is required');
  } else if (data.name.length > 200) {
    errors.push('Product name must be less than 200 characters');
  }

  if (!data.description?.trim()) {
    errors.push('Product description is required');
  } else if (data.description.length > 500) {
    errors.push('Product description must be less than 500 characters');
  }

  if (!data.original_price?.trim()) {
    errors.push('Original price is required');
  }

  if (!data.category?.trim()) {
    errors.push('Category is required');
  }

  // Optional field validations
  if (data.detailed_description && data.detailed_description.length > 2000) {
    errors.push('Detailed description must be less than 2000 characters');
  }

  if (data.rating && (isNaN(data.rating) || data.rating < 0 || data.rating > 5)) {
    errors.push('Rating must be a number between 0 and 5');
  }

  // Validate image URLs
  if (data.main_image_url && !isValidImageUrl(data.main_image_url)) {
    errors.push('Main image URL is not valid');
  }

  // Validate video URLs
  if (data.video_url && !isValidVideoUrl(data.video_url)) {
    errors.push('Video URL is not valid');
  }

  if (data.video_thumbnail_url && !isValidImageUrl(data.video_thumbnail_url)) {
    errors.push('Video thumbnail URL is not valid');
  }

  // Validate features array
  if (data.features && Array.isArray(data.features)) {
    const validFeatures = data.features.filter(f => f && f.trim());
    if (validFeatures.some(f => f.length > 200)) {
      errors.push('Each feature must be less than 200 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // More comprehensive HTML sanitization
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocols
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove data: URLs that could be dangerous
    .replace(/data:(?!image\/[png|jpg|jpeg|gif|webp])/gi, '')
    // Remove vbscript: protocols
    .replace(/vbscript:/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object and embed tags
    .replace(/<(object|embed)\b[^<]*(?:(?!<\/(object|embed)>)<[^<]*)*<\/(object|embed)>/gi, '')
    // Remove form tags
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    // Remove input tags
    .replace(/<input\b[^>]*>/gi, '')
    // Remove link tags with javascript
    .replace(/<a\b[^>]*href\s*=\s*["']javascript:[^"']*["'][^>]*>/gi, '')
    .trim();
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol) &&
           /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlObj.pathname);
  } catch {
    return false;
  }
};

export const isValidVideoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for YouTube URLs
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      return true;
    }
    
    // Check for Vimeo URLs
    if (urlObj.hostname.includes('vimeo.com')) {
      return true;
    }
    
    // Check for direct video file URLs
    if (/\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(urlObj.pathname)) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

export const sanitizeProductData = (data: any) => {
  return {
    ...data,
    name: sanitizeHtml(data.name || ''),
    description: sanitizeHtml(data.description || ''),
    detailed_description: data.detailed_description ? sanitizeHtml(data.detailed_description) : null,
    category: sanitizeHtml(data.category || ''),
    features: Array.isArray(data.features) 
      ? data.features.map(f => sanitizeHtml(f)).filter(f => f.trim())
      : [],
    main_image_url: data.main_image_url ? data.main_image_url.trim() : null,
    video_url: data.video_url ? data.video_url.trim() : null,
    video_thumbnail_url: data.video_thumbnail_url ? data.video_thumbnail_url.trim() : null,
  };
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Input length validation
export const validateInputLength = (input: string, min: number, max: number): boolean => {
  return input.length >= min && input.length <= max;
};

// SQL injection prevention
export const sanitizeForDatabase = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/['"]/g, '') // Remove quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment start
    .replace(/\*\//g, '') // Remove block comment end
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '') // Remove SQL keywords
    .trim();
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    requests.set(identifier, validRequests);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    return true; // Request allowed
  };
};
