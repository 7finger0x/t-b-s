import { type Address, isAddress } from 'viem';

export function normalizeAddress(address: string): Address {
  if (!isAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  return address.toLowerCase() as Address;
}

export function areAddressesEqual(a: string, b: string): boolean {
  try {
    return normalizeAddress(a) === normalizeAddress(b);
  } catch {
    return false;
  }
}