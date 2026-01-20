'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export function FarcasterManifestProvider({ children }: { children: React.ReactNode }) {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [context, setContext] = useState<any>();

    useEffect(() => {
        const load = async () => {
            setContext(await sdk.context);
            sdk.actions.ready();
        };
        if (sdk && !isSDKLoaded) {
            setIsSDKLoaded(true);
            load();
        }
    }, [isSDKLoaded]);

    return <>{children}</>;
}
