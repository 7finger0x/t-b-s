import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Define the EIP-712 Domain from your Smart Contract
const domain = {
    name: 'The Base Standard',
    version: '1',
    chainId: 8453, // Base Mainnet
    verifyingContract: (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const;

// Define the exact Type structure from your Smart Contract
const types = {
    UpdateScore: [
        { name: 'user', type: 'address' },
        { name: 'score', type: 'uint256' },
        { name: 'tier', type: 'uint8' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
} as const;

export async function generateScoreSignature(
    userAddress: `0x${string}`,
    score: number,
    tier: number, // 0=Tourist, 1=Resident, 2=Builder, 3=Based, 4=Legend
    nonce: bigint
) {
    if (!process.env.PRIVATE_KEY) {
        throw new Error("Missing Oracle Private Key");
    }

    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

    const client = createWalletClient({
        account,
        chain: base,
        transport: http()
    });

    // 1 Hour Deadline
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const signature = await client.signTypedData({
        domain,
        types,
        primaryType: 'UpdateScore',
        message: {
            user: userAddress,
            score: BigInt(score),
            tier: tier,
            nonce: nonce,
            deadline: deadline,
        },
    });

    return {
        signature,
        deadline,
        nonce
    };
}
