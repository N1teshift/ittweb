/**
 * @file Defines the main App component, which wraps around all pages.
 * It includes global styles, internationalization, and logging setup.
 * @author ITT Web
 */

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import logger from "@/features/shared/utils/loggerUtils";

// Initialize logging
if (typeof window !== 'undefined') {
  logger.info('ITT Web application started', { 
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
}

/**
 * App component.
 *
 * This is the main application component that Next.js uses to initialize pages.
 * It wraps all page components, allowing for shared layout, state, and global styles.
 * It includes internationalization support and logging.
 *
 * @param {AppProps} props - The properties passed to the component, including the Component and pageProps.
 * @param {React.ElementType} props.Component - The active page component.
 * @param {object} props.pageProps - The initial props that were preloaded for the page.
 * @returns {JSX.Element} The rendered App component with the current page.
 */
function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Component {...pageProps} />
        </>
    );
}

export default appWithTranslation(App);
