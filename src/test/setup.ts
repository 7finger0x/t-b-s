import { afterEach, vi } from 'vitest';

// Cleanup after each test (if needed)
afterEach(() => {
  vi.clearAllMocks();
});

// Set default environment variables for tests
process.env.NEXT_PUBLIC_REGISTRY_ADDRESS = '0x1234567890123456789012345678901234567890';
process.env.NEXT_PUBLIC_NFT_ADDRESS = '0x0987654321098765432109876543210987654321';
process.env.PONDER_RPC_URL = 'https://mainnet.base.org';
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';
