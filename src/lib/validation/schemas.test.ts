import { describe, it, expect } from 'vitest';
import { signRequestSchema, frameRequestSchema } from './schemas';

describe('signRequestSchema', () => {
    it('should validate valid address', () => {
        const result = signRequestSchema.safeParse({
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        });
        
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.address).toBe('0x742d35cc6634c0532925a3b844bc9e7595f0beb5');
        }
    });

    it('should normalize address to lowercase', () => {
        const result = signRequestSchema.safeParse({
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
        });
        
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.address).toBe('0x742d35cc6634c0532925a3b844bc9e7595f0beb5');
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
    it('should validate minimal frame request', () => {
        const result = frameRequestSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should validate frame request with untrustedData', () => {
        const result = frameRequestSchema.safeParse({
            untrustedData: {
                fid: 12345,
                buttonIndex: 1,
            },
        });
        
        expect(result.success).toBe(true);
    });

    it('should reject invalid buttonIndex', () => {
        const result = frameRequestSchema.safeParse({
            untrustedData: {
                buttonIndex: 5, // Max is 4
            },
        });
        
        expect(result.success).toBe(false);
    });

    it('should validate frame request with castId', () => {
        const result = frameRequestSchema.safeParse({
            untrustedData: {
                castId: {
                    fid: 12345,
                    hash: '0xabc123',
                },
            },
        });
        
        expect(result.success).toBe(true);
    });
});
