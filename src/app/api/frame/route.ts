import { NextRequest, NextResponse } from 'next/server';
import { frameRequestSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/prisma';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { getFrameHtmlResponse } from '@/lib/utils/frame';

export async function POST(req: NextRequest): Promise<NextResponse> {
    // Rate limiting: 100 requests per minute per IP
    const rateLimitResponse = rateLimitMiddleware(req);
    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    try {
        // 1. Validate request body
        const body = await req.json();
        const validationResult = frameRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid frame request',
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        // 2. Verify Frame Signature
        // TODO: Implement signature verification. 
        // @coinbase/onchainkit@0.37.5 does not export frame validation utilities.
        // We need to upgrade onchainkit or install @farcaster/hub-nodejs.
        const fid = body.untrustedData?.fid;
        let score = 0;
        let tier = 'TOURIST';

        // TODO: Map FID to address if they haven't connected before
        // For now, we rely on the user having linked their address in our DB
        // or a future implementation where we query by FID

        // Mock lookup for now to prevent breaking changes while DB is updated
        // const user = await prisma.user.findFirst({ where: { fid } });

        // 3. Generate dynamic OG image URL
        const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-standard.xyz';
        const imageUrl = `${appUrl}/api/og/score?score=${score}&tier=${tier}`;

        // 4. Return frame response
        return new NextResponse(
            getFrameHtmlResponse({
                buttons: [
                    { label: `Score: ${score} (${tier})` },
                    {
                        action: 'link',
                        label: 'Mint Badge',
                        target: `${appUrl}/mint`
                    }
                ],
                image: { src: imageUrl },
            })
        );
    } catch (error) {
        console.error('Frame route error:', error);

        const errorMessage = process.env.NODE_ENV === 'development'
            ? (error instanceof Error ? error.message : 'Internal Server Error')
            : 'Internal Server Error';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
