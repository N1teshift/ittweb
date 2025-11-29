import path from "path";
import { UserConfig } from "next-i18next";

const nextI18NextConfig: UserConfig = {
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
    localePath: path.resolve("./public/locales"),
    defaultNS: "common",
    fallbackNS: [],
    keySeparator: ".",
    reloadOnPrerender: process.env.NODE_ENV === "development",
};

export default nextI18NextConfig;









