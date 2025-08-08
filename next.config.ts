import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    i18n: {
        locales: ["en"], // Starting with English, can add more languages later
        defaultLocale: "en",   // Default language
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
                            "style-src 'self' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com",
                            "frame-src 'self' https://www.youtube.com",
                            "img-src 'self' data: https: blob:",
                            "media-src 'self' https:",
                            "connect-src 'self' https:",
                            "font-src 'self' data:",
                        ].join('; ')
                    }
                ]
            }
        ];
    }
};

export default nextConfig;
