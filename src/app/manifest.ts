import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'The Base Standard',
        short_name: 'Base Standard',
        description: 'Provable Value Contribution (PVC) Reputation Protocol on Base.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0052ff', // Base Blue
        theme_color: '#0052ff',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        // Optional: Categories for Base Ecosystem Discovery
        categories: ['finance', 'social', 'utilities'],
    };
}
