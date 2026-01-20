import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { rateLimitMiddleware } from './rateLimit';

describe('rateLimitMiddleware', () => {
    beforeEach(() => {
        // Clear module cache to reset rate limiter state
        vi.resetModules();
    });

    it('should allow requests under limit', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            headers: {
                'x-forwarded-for': '192.168.1.1',
            },
        });

        const response = rateLimitMiddleware(req);
        expect(response).toBeNull(); // null means allowed
    });

    it('should rate limit after 100 requests', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            headers: {
                'x-forwarded-for': '192.168.1.2',
            },
        });

        // Make 100 requests (should all pass)
        for (let i = 0; i < 100; i++) {
            const response = rateLimitMiddleware(req);
            expect(response).toBeNull();
        }

        // 101st request should be rate limited
        const rateLimitedResponse = rateLimitMiddleware(req);
        expect(rateLimitedResponse).not.toBeNull();
        expect(rateLimitedResponse?.status).toBe(429);

        const data = await rateLimitedResponse?.json();
        expect(data.error).toBe('Rate limit exceeded');
    });

    it('should include rate limit headers', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            headers: {
                'x-forwarded-for': '192.168.1.3',
            },
        });

        // Make 50 requests
        for (let i = 0; i < 50; i++) {
            rateLimitMiddleware(req);
        }

        // Next request should have headers (we need to check the response)
        // Since we can't easily check headers on null response, we'll test the rate limited case
        for (let i = 0; i < 50; i++) {
            rateLimitMiddleware(req);
        }

        const rateLimitedResponse = rateLimitMiddleware(req);
        expect(rateLimitedResponse?.headers.get('X-RateLimit-Limit')).toBe('100');
        expect(rateLimitedResponse?.headers.get('X-RateLimit-Remaining')).toBe('0');
        expect(rateLimitedResponse?.headers.get('Retry-After')).toBeTruthy();
    });

    it('should use IP address as identifier', async () => {
        const req1 = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            headers: {
                'x-forwarded-for': '192.168.1.4',
            },
        });

        const req2 = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            headers: {
                'x-forwarded-for': '192.168.1.5',
            },
        });

        // Rate limit req1
        for (let i = 0; i < 101; i++) {
            rateLimitMiddleware(req1);
        }

        // req2 should still work (different IP)
        const response = rateLimitMiddleware(req2);
        expect(response).toBeNull();
    });
});
