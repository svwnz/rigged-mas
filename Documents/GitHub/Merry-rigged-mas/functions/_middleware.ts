// Security Headers for Cloudflare Pages
// This file adds security headers via functions/_headers or can be used as reference

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  
  // Security Headers
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://esm.sh;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
      media-src 'self' https:;
      connect-src 'self' https:;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim()
  };

  // Add security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

// Rate limiting helper (can be used in API endpoints)
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();
  
  static async checkRateLimit(
    ip: string, 
    maxRequests: number = 10, 
    windowMs: number = 60000 // 1 minute
  ): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const requestData = this.requests.get(ip);
    
    if (!requestData || requestData.resetTime < windowStart) {
      this.requests.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (requestData.count >= maxRequests) {
      return false;
    }
    
    requestData.count++;
    return true;
  }
}

// Input sanitization helper
export function sanitizeInput(input: string, maxLength: number = 100): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, ''); // Remove event handlers
}