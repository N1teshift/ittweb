import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    i18n: {
        locales: ["en"], // Starting with English, can add more languages later
        defaultLocale: "en",   // Default language
    },
};

export default nextConfig;
