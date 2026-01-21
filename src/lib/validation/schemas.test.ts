
import { describe, it, expect } from 'vitest';
import { signRequestSchema, frameRequestSchema } from './schemas';

describe('signRequestSchema', () => {
    it('should validate valid address', () => {
        const result = signRequestSchema.safeParse({
            address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.address).toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
        }
    });

    it('should normalize address to lowercase', () => {
        const result = signRequestSchema.safeParse({
            address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.address).toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
        }
    });

    it('should reject invalid address', () => {
        const result = signRequestSchema.safeParse({
            address: 'invalid',
        });

        expect(result.success).toBe(false);
    });

    it('should reject missing address', () => {
        const result = signRequestSchema.safeParse({});
        expect(result.success).toBe(false);
    });
});

describe('frameRequestSchema', () => {
    it('should reject empty frame request', () => {
        const result = frameRequestSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it('should validate complete valid frame request', () => {
        const result = frameRequestSchema.safeParse({
            untrustedData: {
                fid: 12345,
                url: 'https://example.com',
                messageHash: '0xhash',
                timestamp: 123456,
                network: 1,
                buttonIndex: 1,
                castId: {
                    fid: 12345,
                    hash: '0xabc123',
                },
            },
            trustedData: {
                messageBytes: '0xbytes',
            },
        });

        expect(result.success).toBe(true);
    });

    it('should reject frame request missing fields', () => {
        const result = frameRequestSchema.safeParse({
            untrustedData: {
                fid: 12345,
                // Missing other required fields
            },
        });

        expect(result.success).toBe(false);
    });
});
