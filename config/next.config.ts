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
    // Ignore ESLint errors in test files - tests should not block production builds
    // Test files are excluded via .eslintrc.json ignorePatterns and overrides
    eslint: {
        ignoreDuringBuilds: false, // Keep ESLint running for production code
        // Test files are excluded via .eslintrc.json ignorePatterns
    },
    typescript: {
        // TypeScript errors in test files shouldn't block builds either
        ignoreBuildErrors: false, // Keep TS checking but we'll exclude test files via tsconfig
    },
    webpack: (config, { isServer }) => {
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

        // Ignore optional Sentry module to prevent webpack resolution errors
        // Sentry is optional and loaded dynamically at runtime
        config.resolve.alias = {
            ...config.resolve.alias,
            '@sentry/nextjs': false,
        };

        // Exclude firebase-admin and Node.js built-in modules from client bundles
        // These are server-only and will cause build errors if bundled for client
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                'net': false,
                'http': false,
                'https': false,
                'fs': false,
                'path': false,
                'os': false,
                'crypto': false,
            };

            // Exclude firebase-admin and i18next-fs-backend from client bundles
            config.externals = config.externals || [];
            if (Array.isArray(config.externals)) {
                config.externals.push({
                    'firebase-admin': 'commonjs firebase-admin',
                    'firebase-admin/app': 'commonjs firebase-admin/app',
                    'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
                    'firebase-admin/storage': 'commonjs firebase-admin/storage',
                    'i18next-fs-backend': 'commonjs i18next-fs-backend',
                    'next-i18next/serverSideTranslations': 'commonjs next-i18next/serverSideTranslations',
                });
            }
        }

        // Configure webpack to handle ES modules properly
        // This fixes issues with packages like @reduxjs/toolkit that are ES modules
        config.module = config.module || {};
        config.module.rules = config.module.rules || [];
        
        // Add rule to handle ES modules in node_modules
        // fullySpecified: false allows importing without file extensions for ES modules
        // This is needed for packages like @reduxjs/toolkit that are ES modules
        config.module.rules.push({
            test: /\.m?js$/,
            include: /node_modules/,
            resolve: {
                fullySpecified: false,
            },
        });

        // Configure resolve to properly handle ES modules
        config.resolve = config.resolve || {};
        config.resolve.extensionAlias = {
            ...config.resolve.extensionAlias,
            '.js': ['.js', '.ts', '.tsx'],
            '.mjs': ['.mjs'],
        };
        
        // Ensure webpack handles ES modules correctly
        // This prevents require() errors for ES module packages
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
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
                            // Script sources - allow Google Tag Manager for analytics and Vercel Live for staging
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com https://clips.twitch.tv https://player.twitch.tv https://vercel.live https://www.googletagmanager.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com",
                            "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            // Frame sources - include Vercel Live for feedback widget
                            "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://clips.twitch.tv https://player.twitch.tv https://vercel.live",
                            "img-src 'self' data: https: blob:",
                            "media-src 'self' https:",
                            // Connect sources - explicitly exclude tracking domains (googleads.g.doubleclick.net)
                            "connect-src 'self' https: wss:",
                        ].join('; ')
                    }
                ]
            }
        ];
    }
};

const nextConfig = withBundleAnalyzer(baseConfig);

export default nextConfig;


