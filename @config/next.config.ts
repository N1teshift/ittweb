import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

const baseConfig: NextConfig = {
    reactStrictMode: false,
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
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
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.youtube.com https://s.ytimg.com",
                            "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "frame-src 'self' https://www.youtube.com https://clips.twitch.tv",
                            "img-src 'self' data: https: blob:",
                            "media-src 'self' https:",
                            "connect-src 'self' https:",
                        ].join('; ')
                    }
                ]
            }
        ];
    }
};

const nextConfig = withBundleAnalyzer(baseConfig);

export default nextConfig;


