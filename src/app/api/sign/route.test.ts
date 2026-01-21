
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock dependencie
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('@/lib/scoring/signer', () => ({
    generateScoreSignature: vi.fn(),
}));

// Mock viem
const { mockReadContract } = vi.hoisted(() => {
    return { mockReadContract: vi.fn() };
});

vi.mock('viem', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        createPublicClient: vi.fn(() => ({
            readContract: mockReadContract,
        })),
        http: vi.fn(),
    };
});

import { prisma } from '@/lib/prisma';
import { generateScoreSignature } from '@/lib/scoring/signer';

describe('POST /api/sign', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset env vars if needed
        process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x1234567890123456789012345678901234567890';
    });

    it('should return 400 for invalid address', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({ address: 'invalid-address' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("Invalid request");
    });

    it('should return 404 if user not found', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({ address: '0x1234567890123456789012345678901234567890' }),
        });

        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const res = await POST(req);
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toBe('User not found');
    });

    it('should return signature for valid user', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({ address: '0x1234567890123456789012345678901234567890' }),
        });

        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: '1',
            address: '0x1234567890123456789012345678901234567890',
            totalScore: 1000,
            tier: 'BUILDER',
            lastUpdated: new Date(),
            sybilMultiplier: 1.0,
            scoreEconomic: 0,
            scoreSocial: 0,
            scoreTenure: 0,
            ensName: null
        });

        mockReadContract.mockResolvedValue(BigInt(10)); // nonce

        vi.mocked(generateScoreSignature).mockResolvedValue({
            signature: '0xsig',
            deadline: BigInt(1234567890),
            nonce: BigInt(10)
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.signature).toBe('0xsig');
        expect(json.score).toBe(1000);
        // BUILDER maps to 2
        expect(json.tier).toBe(2);
    });
});
