import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT = 100;
const WINDOW_MS = 60 * 1000; // 1 minute

// Simple in-memory store for rate limiting
// Note: In a serverless environment, this state is not shared across instances.
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

export async function middleware(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || (now - record.startTime > WINDOW_MS)) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
    } else {
        record.count += 1;
        if (record.count > RATE_LIMIT) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};