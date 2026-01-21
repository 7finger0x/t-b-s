
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Suppress strict mode if needed, but usually good to keep true
    reactStrictMode: true,

    // Allow experimental features if specifically needed, otherwise standard
    experimental: {
        serverComponentsExternalPackages: ['pino', 'sharp'], // Common external packages
    },
};

export default nextConfig;
