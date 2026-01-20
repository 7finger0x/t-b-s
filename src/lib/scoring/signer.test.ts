import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateScoreSignature } from './signer';

// Mock viem
vi.mock('viem', async () => {
    const actual = await vi.importActual('viem');
    return {
        ...actual,
        createWalletClient: vi.fn(),
        http: vi.fn(),
    };
});

vi.mock('viem/accounts', () => ({
    privateKeyToAccount: vi.fn(),
}));

describe('generateScoreSignature', () => {
    beforeEach(() => {
        process.env.PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';
        process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x1234567890123456789012345678901234567890';
    });

    it('should throw error if PRIVATE_KEY is missing', async () => {
        delete process.env.PRIVATE_KEY;

        await expect(
            generateScoreSignature(
                '0xabc123def4567890123456789012345678901234',
                865,
                3,
                BigInt(0)
            )
        ).rejects.toThrow('Missing Oracle Private Key');
    });

    it('should generate signature with correct parameters', async () => {
        const mockAccount = {
            address: '0x1234567890123456789012345678901234567890',
        };

        const mockSignTypedData = vi.fn().mockResolvedValue('0xsignature');
        const mockClient = {
            signTypedData: mockSignTypedData,
        };

        const { privateKeyToAccount } = await import('viem/accounts');
        const { createWalletClient } = await import('viem');

        vi.mocked(privateKeyToAccount).mockReturnValue(mockAccount as any);
        vi.mocked(createWalletClient).mockReturnValue(mockClient as any);

        const result = await generateScoreSignature(
            '0xabc123def4567890123456789012345678901234',
            865,
            3,
            BigInt(0)
        );

        expect(result.signature).toBe('0xsignature');
        expect(result.deadline).toBeGreaterThan(BigInt(0));
        expect(result.nonce).toBe(BigInt(0));
        
        // Verify signTypedData was called with correct structure
        expect(mockSignTypedData).toHaveBeenCalledWith(
            expect.objectContaining({
                domain: expect.objectContaining({
                    name: 'The Base Standard',
                    version: '1',
                }),
                primaryType: 'UpdateScore',
                message: expect.objectContaining({
                    user: '0xabc123def4567890123456789012345678901234',
                    score: BigInt(865),
                    tier: 3,
                    nonce: BigInt(0),
                }),
            })
        );
    });
});
