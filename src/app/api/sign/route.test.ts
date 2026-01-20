import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPublicClient } from 'viem';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('viem', async () => {
    const actual = await vi.importActual('viem');
    return {
        ...actual,
        createPublicClient: vi.fn(),
        http: vi.fn(),
    };
});

vi.mock('@/lib/scoring/signer', () => ({
    generateScoreSignature: vi.fn(),
}));

describe('POST /api/sign', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set required env vars
        process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x1234567890123456789012345678901234567890';
        process.env.PONDER_RPC_URL = 'https://mainnet.base.org';
    });

    it('should return 400 for invalid address', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({ address: 'invalid' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
        
        const data = await response.json();
        expect(data.error).toBe('Invalid request');
    });

    it('should return 400 for missing address', async () => {
        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({ 
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5' 
            }),
        });

        const response = await POST(req);
        expect(response.status).toBe(404);
        
        const data = await response.json();
        expect(data.error).toBe('User not found');
    });

    it('should return signature for valid user', async () => {
        const mockUser = {
            id: '1',
            address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb5',
            totalScore: 865,
            tier: 'BASED',
            scoreEconomic: 0,
            scoreSocial: 0,
            scoreTenure: 0,
            sybilMultiplier: 1.0,
            lastUpdated: new Date(),
        };

        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

        // Mock contract read
        const mockReadContract = vi.fn().mockResolvedValue(BigInt(0));
        vi.mocked(createPublicClient).mockReturnValue({
            readContract: mockReadContract,
        } as any);

        // Mock signature generation
        const { generateScoreSignature } = await import('@/lib/scoring/signer');
        vi.mocked(generateScoreSignature).mockResolvedValue({
            signature: '0xsignature',
            deadline: BigInt(1234567890),
            nonce: BigInt(0),
        });

        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({ 
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5' 
            }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data.score).toBe(865);
        expect(data.tier).toBe(3); // BASED
        expect(data.signature).toBe('0xsignature');
    });

    it('should normalize address before database query', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const req = new NextRequest('http://localhost/api/sign', {
            method: 'POST',
            body: JSON.stringify({ 
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5' 
            }),
        });

        await POST(req);

        // Verify address was normalized to lowercase
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { address: '0x742d35cc6634c0532925a3b844bc9e7595f0beb5' },
        });
    });
});
