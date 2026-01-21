import { describe, it, expect } from 'vitest';
import { normalizeAddress, isValidAddress } from './address';

describe('normalizeAddress', () => {
    it('should normalize uppercase address to lowercase', () => {
        // Valid 42-character Ethereum address
        const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const result = normalizeAddress(address);
        expect(result).toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
    });

    it('should keep lowercase address unchanged', () => {
        const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
        const result = normalizeAddress(address);
        expect(result).toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
    });

    it('should normalize mixed case address', () => {
        const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const result = normalizeAddress(address);
        expect(result).toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
    });

    it('should throw error for invalid address format', () => {
        expect(() => normalizeAddress('invalid')).toThrow('Invalid Ethereum address');
        expect(() => normalizeAddress('0x123')).toThrow('Invalid Ethereum address');
        expect(() => normalizeAddress('')).toThrow('Address is required');
    });

    it('should handle checksummed addresses', () => {
        // Valid checksummed address (Ethereum format)
        const checksummed = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4';
        const result = normalizeAddress(checksummed);
        expect(result).toBe('0x5b38da6a701c568545dcfcb03fcb875f56beddc4');
    });
});

describe('isValidAddress', () => {
    it('should return true for valid addresses', () => {
        expect(isValidAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')).toBe(true);
        expect(isValidAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(true);
    });

    it('should return false for invalid addresses', () => {
        expect(isValidAddress('invalid')).toBe(false);
        expect(isValidAddress('0x123')).toBe(false);
        expect(isValidAddress('')).toBe(false);
        expect(isValidAddress('not-an-address')).toBe(false);
    });
});
