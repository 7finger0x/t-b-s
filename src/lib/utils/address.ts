import { getAddress, isAddress } from 'viem';

/**
 * Normalizes an Ethereum address to lowercase for consistent storage and comparison.
 * Validates the address format before normalization.
 * 
 * @param address - Ethereum address (checksummed or lowercase)
 * @returns Normalized lowercase address
 * @throws Error if address is invalid
 * 
 * @example
 * ```ts
 * normalizeAddress('0xABC123...') // '0xabc123...'
 * normalizeAddress('0xabc123...') // '0xabc123...'
 * ```
 */
export function normalizeAddress(address: string): `0x${string}` {
  if (!address) {
    throw new Error('Address is required');
  }

  try {
    // Use getAddress to validate and normalize (handles checksumming)
    const normalized = getAddress(address);
    // Convert to lowercase for storage
    return normalized.toLowerCase() as `0x${string}`;
  } catch (error) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
}

/**
 * Validates if a string is a valid Ethereum address.
 * 
 * @param address - String to validate
 * @returns true if valid Ethereum address, false otherwise
 */
export function isValidAddress(address: string): address is `0x${string}` {
  try {
    getAddress(address);
    return true;
  } catch {
    return false;
  }
}
