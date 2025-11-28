import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const baseConfig: NextConfig = {
    reactStrictMode: false,
    pageExtensions: ['page.tsx', 'page.ts', 'tsx', 'ts', 'jsx', 'js', 'mdx', 'md'],
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
    webpack: (config) => {
        // Exclude test files and __tests__ directories from page building
        const originalEntry = config.entry;
        config.entry = async () => {
            const entries = await originalEntry();
            // Filter out test files from entries
            if (typeof entries === 'object') {
                Object.keys(entries).forEach((key) => {
                    if (key.includes('__tests__') || key.includes('.test.') || key.includes('.spec.')) {
                        delete entries[key];
                    }
                });
            }
            return entries;
        };
        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com https://www.googletagmanager.com https://www.google-analytics.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.youtube.com https://s.ytimg.com",
                            "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "frame-src 'self' https://www.youtube.com https://clips.twitch.tv",
                            "img-src 'self' data: https: blob:",
                            "media-src 'self' https:",
                            "connect-src 'self' https: https://www.google-analytics.com https://www.googletagmanager.com",
                        ].join('; ')
                    }
                ]
            }
        ];
    }
};

const nextConfig = withBundleAnalyzer(baseConfig);

export default nextConfig;


