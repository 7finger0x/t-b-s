import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { middleware } from './middleware';

// Mock NextResponse
vi.mock('next/server', () => {
    return {
        NextResponse: class {
            status: number;
            body: any;
            headers: Map<string, string>;

            constructor(body?: any, init?: any) {
                this.status = init?.status || 200;
                this.body = body;
                this.headers = new Map();
            }

            static next() {
                return new this(null, { status: 200 });
            }
        }
    };
});

// Helper to create a mock request
const createMockRequest = (ip?: string) => ({
    ip,
    url: 'http://localhost/api/test',
} as any);

describe('Rate Limiting Middleware', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('should allow requests under the limit', async () => {
        const req = createMockRequest('192.168.1.1');

        for (let i = 0; i < 10; i++) {
            const res = await middleware(req);
            expect(res.status).toBe(200);
        }
    });

    it('should block requests over the limit', async () => {
        const req = createMockRequest('192.168.1.2');

        // Consume all 100 tokens
        for (let i = 0; i < 100; i++) {
            const res = await middleware(req);
            expect(res.status).toBe(200);
        }

        // Next one should fail
        const res = await middleware(req);
        expect(res.status).toBe(429);
    });

    it('should reset limit after window expires', async () => {
        const req = createMockRequest('192.168.1.3');

        // Consume limit
        for (let i = 0; i < 101; i++) {
            await middleware(req);
        }

        // Verify blocked
        let res = await middleware(req);
        expect(res.status).toBe(429);

        // Advance time > 60s (WINDOW_MS)
        vi.advanceTimersByTime(60001);

        // Should be allowed again
        res = await middleware(req);
        expect(res.status).toBe(200);
    });

    it('should track IPs separately', async () => {
        const req1 = createMockRequest('192.168.1.4');
        const req2 = createMockRequest('192.168.1.5');

        // Block IP 1
        for (let i = 0; i < 101; i++) {
            await middleware(req1);
        }
        expect((await middleware(req1)).status).toBe(429);

        // IP 2 should be fine
        expect((await middleware(req2)).status).toBe(200);
    });

    it('should default to 127.0.0.1 if ip is missing', async () => {
        const req = createMockRequest(undefined);
        const res = await middleware(req);
        expect(res.status).toBe(200);
    });
});