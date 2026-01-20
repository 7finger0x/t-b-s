import { NextRequest, NextResponse } from 'next/server';
import { generateScoreSignature } from '@/lib/scoring/signer';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { address } = await req.json();

        if (!address) {
            return NextResponse.json({ error: 'Address required' }, { status: 400 });
        }

        // 1. Fetch User Score from DB
        const user = await prisma.user.findUnique({
            where: { address },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Map Tier String to Enum Int (Matching Contract)
        const TIER_MAP: Record<string, number> = {
            'TOURIST': 0,
            'RESIDENT': 1,
            'BUILDER': 2,
            'BASED': 3,
            'LEGEND': 4
        };
        const tierInt = TIER_MAP[user.tier] ?? 0;

        // 3. Get Nonce (Mocked: In production, query the contract for nonces[user])
        const nonce = BigInt(0);

        // 4. Generate Signature
        const { signature, deadline } = await generateScoreSignature(
            address as `0x${string}`,
            user.totalScore,
            tierInt,
            nonce
        );

        return NextResponse.json({
            score: user.totalScore,
            tier: tierInt,
            signature,
            deadline: deadline.toString(),
        });

    } catch (error) {
        console.error("Signing Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
