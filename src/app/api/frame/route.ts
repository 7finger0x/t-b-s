import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const body = await req.json();
    // Validating the request would go here using OnchainKit's validation utilities

    // Dynamic Image Generation URL (Simulated for this spec)
    const imageUrl = `${process.env.NEXT_PUBLIC_URL}/api/og/score?score=865&tier=BASED`;

    return new NextResponse(
        getFrameHtmlResponse({
            buttons: [{ label: 'Score: 865 (BASED)' }, { action: 'link', label: 'Mint Badge', target: 'https://base-standard.xyz/mint' }],
            image: { src: imageUrl },
        })
    );
}
