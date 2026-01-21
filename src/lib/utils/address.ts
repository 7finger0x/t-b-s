import { type Address, isAddress } from 'viem';

export function normalizeAddress(address: string): Address {
  if (!address) {
    throw new Error('Address is required');
  }
  if (!isAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  return address.toLowerCase() as Address;
}

export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

export function areAddressesEqual(a: string, b: string): boolean {
  if (!isAddress(a) || !isAddress(b)) return false;
  return a.toLowerCase() === b.toLowerCase();
}