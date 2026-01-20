import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter.
 * For production, consider using Redis/Upstash Ratelimit or similar distributed solution.
 */
class RateLimiter {
    private requests: Map<string, { count: number; resetAt: number }>;
    private readonly windowMs: number;
    private readonly maxRequests: number;

    constructor(maxRequests: number, windowMs: number) {
        this.requests = new Map();
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    /**
     * Check if a request should be allowed.
     * @param identifier - Unique identifier (IP address, user address, etc.)
     * @returns Object with allowed status and reset time
     */
    check(identifier: string): { allowed: boolean; resetAt: number; remaining: number } {
        const now = Date.now();
        const record = this.requests.get(identifier);

        // Clean up expired entries
        if (record && record.resetAt < now) {
            this.requests.delete(identifier);
        }

        const current = this.requests.get(identifier);

        if (!current) {
            // First request in window
            this.requests.set(identifier, {
                count: 1,
                resetAt: now + this.windowMs,
            });
            return {
                allowed: true,
                resetAt: now + this.windowMs,
                remaining: this.maxRequests - 1,
            };
        }

        if (current.count >= this.maxRequests) {
            // Rate limit exceeded
            return {
                allowed: false,
                resetAt: current.resetAt,
                remaining: 0,
            };
        }

        // Increment count
        current.count++;
        return {
            allowed: true,
            resetAt: current.resetAt,
            remaining: this.maxRequests - current.count,
        };
    }

    /**
     * Clean up old entries (call periodically in production)
     */
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.requests.entries()) {
            if (value.resetAt < now) {
                this.requests.delete(key);
            }
        }
    }
}

// Rate limit: 100 requests per minute per identifier
const rateLimiter = new RateLimiter(100, 60 * 1000);

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

/**
 * Rate limiting middleware for Next.js API routes.
 * Limits requests to 100 per minute per IP address (or custom identifier).
 * 
 * @param req - Next.js request object
 * @param identifier - Optional custom identifier (defaults to IP address)
 * @returns NextResponse with 429 status if rate limited, null if allowed
 */
export function rateLimit(
    req: NextRequest,
    identifier?: string
): NextResponse | null {
    // Use custom identifier or fall back to IP address
    const id = identifier || getClientIP(req);
    
    const result = rateLimiter.check(id);

    if (!result.allowed) {
        const resetSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
        
        return NextResponse.json(
            {
                error: 'Rate limit exceeded',
                message: `Too many requests. Please try again in ${resetSeconds} seconds.`,
                resetAt: new Date(result.resetAt).toISOString(),
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': result.remaining.toString(),
                    'X-RateLimit-Reset': result.resetAt.toString(),
                    'Retry-After': resetSeconds.toString(),
                },
            }
        );
    }

    // Add rate limit headers to successful responses
    return null; // null means request is allowed
}

/**
 * Get client IP address from request.
 * Handles various proxy headers (X-Forwarded-For, etc.)
 */
function getClientIP(req: NextRequest): string {
    // Check X-Forwarded-For header (most common)
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        // Take first IP if multiple (client -> proxy1 -> proxy2)
        return forwarded.split(',')[0].trim();
    }

    // Check X-Real-IP header
    const realIP = req.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback to connection remote address (if available)
    // In Next.js, this might not be available, so use a default
    return req.ip || 'unknown';
}

/**
 * Rate limit wrapper for API route handlers.
 * Usage:
 * ```ts
 * export async function POST(req: NextRequest) {
 *   const rateLimitResponse = rateLimitMiddleware(req);
 *   if (rateLimitResponse) return rateLimitResponse;
 *   // ... rest of handler
 * }
 * ```
 */
export function rateLimitMiddleware(req: NextRequest): NextResponse | null {
    return rateLimit(req);
}
