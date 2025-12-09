/**
 * 🔒 SECURITY: Rate Limiting Utility
 * 
 * Prevents abuse and resource exhaustion attacks by limiting request frequency.
 * Uses in-memory storage (for serverless, consider Redis for distributed systems).
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// In-memory rate limit store
// In production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier?: string; // Optional custom identifier (defaults to IP)
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const { windowMs, maxRequests } = options;
  const key = options.identifier 
    ? `${options.identifier}:${identifier}` 
    : identifier;
  
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request (works with Next.js API routes)
 */
export function getClientIP(request: { headers: { [key: string]: string | string[] | undefined } }): string {
  const headers = request.headers;
  
  // Helper to safely get header value
  const getHeader = (key: string): string | null => {
    const value = headers[key];
    if (Array.isArray(value)) {
      return value[0] || null;
    }
    return value || null;
  };
  
  // Try various headers (proxies may set different ones)
  const forwarded = getHeader('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = getHeader('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback (may not work in all environments)
  return 'unknown';
}

