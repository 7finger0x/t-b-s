import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: 'The Base Standard',
    description: 'On-chain Reputation & PVC Scoring',
    manifest: '/manifest.json',
    other: {
        'fc:frame': JSON.stringify({
            version: 'next',
            imageUrl: 'https://base-standard.xyz/opengraph-image.png',
            button: {
                title: 'Check PVC Score',
                action: {
                    type: 'launch_frame',
                    name: 'Base Standard',
                    url: 'https://base-standard.xyz',
                    splashImageUrl: 'https://base-standard.xyz/splash.png',
                    splashBackgroundColor: '#0052ff',
                },
            },
        }),
    },
};


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
