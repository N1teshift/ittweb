import type { UserConfig } from 'next-i18next';

const config: UserConfig = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },
    localePath: './public/locales',
    reloadOnPrerender: process.env.NODE_ENV === 'development',
};

export default config;
