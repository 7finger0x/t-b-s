import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock Prisma
import { vi } from 'vitest';
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

describe('POST /api/frame', () => {
    beforeEach(() => {
        process.env.NEXT_PUBLIC_URL = 'https://base-standard.xyz';
    });

    it('should return frame response for valid request', async () => {
        const req = new NextRequest('http://localhost/api/frame', {
            method: 'POST',
            body: JSON.stringify({
                untrustedData: {
                    fid: 12345,
                    buttonIndex: 1,
                },
            }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);

        const html = await response.text();
        expect(html).toContain('Score: 0 (TOURIST)');
        expect(html).toContain('Mint Badge');
    });

    it('should handle empty request body', async () => {
        const req = new NextRequest('http://localhost/api/frame', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
    });

    it('should return 400 for invalid buttonIndex', async () => {
        const req = new NextRequest('http://localhost/api/frame', {
            method: 'POST',
            body: JSON.stringify({
                untrustedData: {
                    buttonIndex: 5, // Invalid: max is 4
                },
            }),
        });

        const response = await POST(req);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data.error).toBe('Invalid frame request');
    });
});
