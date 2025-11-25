/**
 * @file Defines the main App component, which wraps around all pages.
 * It includes global styles, internationalization, and logging setup.
 * @author ITT Web
 */

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import Head from "next/head";
import Layout from "@/features/shared/components/Layout";
import { Logger } from "@/features/infrastructure/logging";

// Initialize logging
if (typeof window !== 'undefined') {
  Logger.info('ITT Web application started', { 
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
}

// Extended pageProps interface to include translation namespaces
interface ExtendedPageProps {
  session?: Session;
  translationNamespaces?: string[];
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
    // Extract translation namespaces from pageProps, fallback to ["common"]
    const extendedProps = pageProps as ExtendedPageProps;
    const translationNamespaces = extendedProps?.translationNamespaces || ["common"];
    
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            </Head>
            <SessionProvider session={extendedProps?.session}>
                <Layout pageTranslationNamespaces={translationNamespaces}>
                    <Component {...pageProps} />
                </Layout>
            </SessionProvider>
        </>
    );
}

export default appWithTranslation(App);
