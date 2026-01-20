import { NextRequest, NextResponse } from 'next/server';
import { generateScoreSignature } from '@/lib/scoring/signer';
import { prisma } from '@/lib/prisma';
import { signRequestSchema } from '@/lib/validation/schemas';
import { normalizeAddress } from '@/lib/utils/address';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { rateLimitMiddleware } from '@/middleware/rateLimit';

// Registry ABI for reading nonces
const REGISTRY_ABI = [
    {
        type: 'function',
        name: 'nonces',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

// Create public client for contract reads
const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.PONDER_RPC_URL || 'https://mainnet.base.org'),
});

export async function POST(req: NextRequest) {
    // Rate limiting: 100 requests per minute per IP
    const rateLimitResponse = rateLimitMiddleware(req);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        // 1. Validate and parse request body
        const body = await req.json();
        const validationResult = signRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid request',
                    details: validationResult.error.errors
                },
                { status: 400 }
            );
        }

        const { address } = validationResult.data;
        const normalizedAddress = normalizeAddress(address);

        // 2. Fetch User Score from DB (using normalized address)
        const user = await prisma.user.findUnique({
            where: { address: normalizedAddress },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Map Tier String to Enum Int (Matching Contract)
        const TIER_MAP: Record<string, number> = {
            'TOURIST': 0,
            'RESIDENT': 1,
            'BUILDER': 2,
            'BASED': 3,
            'LEGEND': 4
        };
        const tierInt = TIER_MAP[user.tier] ?? 0;

        // 4. Query Nonce from Contract
        const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}`;
        if (!registryAddress) {
            return NextResponse.json(
                { error: 'Registry address not configured' },
                { status: 500 }
            );
        }

        let nonce: bigint;
        try {
            nonce = await publicClient.readContract({
                address: registryAddress,
                abi: REGISTRY_ABI,
                functionName: 'nonces',
                args: [normalizedAddress],
            });
        } catch (error) {
            console.error('Failed to fetch nonce from contract:', error);
            throw new Error(`Failed to fetch nonce from contract: ${error}`);
        }

        // 5. Generate Signature
        const { signature, deadline } = await generateScoreSignature(
            normalizedAddress,
            user.totalScore,
            tierInt,
            nonce
        );

        return NextResponse.json({
            score: user.totalScore,
            tier: tierInt,
            signature,
            deadline: deadline.toString(),
            nonce: nonce.toString(),
        });

    } catch (error) {
        console.error("Signing Error:", error);

        // Don't expose internal error details in production
        const errorMessage = process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : 'Internal Server Error')
            : 'Internal Server Error';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
