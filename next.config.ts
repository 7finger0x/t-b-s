
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    serverExternalPackages: ['pino', 'sharp', '@wagmi/core', '@wagmi/connectors'],
};

export default nextConfig;
