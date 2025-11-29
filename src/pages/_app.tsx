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
import { useEffect } from "react";
import { SWRConfig } from "swr";
import Layout from "@/features/infrastructure/components/Layout";
import { Logger } from "@/features/infrastructure/logging";
import { initializeErrorTracking, initializePerformanceMonitoring } from "@/features/infrastructure/monitoring";
import { swrConfig } from "@/features/infrastructure/lib/swrConfig";

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
    
    // Initialize monitoring (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            initializeErrorTracking();
            initializePerformanceMonitoring();
            
            // Filter known third-party script errors in development
            // These errors are harmless but clutter the console
            if (process.env.NODE_ENV === 'development') {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                // Patterns for errors/warnings to suppress
                const suppressPatterns = [
                    // Google Ads tracking errors
                    /Cross-Origin Request Blocked.*googleads\.g\.doubleclick\.net/i,
                    /googleads\.g\.doubleclick\.net/i,
                    /doubleclick\.net/i,
                    // YouTube cookie warnings
                    /Cookie.*__Secure-YEC.*has been rejected/i,
                    /Cookie.*LAST_RESULT_ENTRY_KEY.*will soon be rejected/i,
                    /Cookie.*will soon be rejected.*Partitioned/i,
                    // Feature Policy warnings (deprecated API, harmless)
                    /Feature Policy: Skipping unsupported feature name/i,
                    // CSP warnings about unknown directives (harmless)
                    /Content-Security-Policy: Couldn't process unknown directive/i,
                    /require-trusted-types-for/i,
                    // YouTube third-party context warnings (expected behavior)
                    /Partitioned cookie or storage access was provided.*youtube/i,
                    // Unreachable code warnings from minified third-party scripts (YouTube's minified code)
                    /unreachable code after return statement/i,
                    // YouTube script files (minified code warnings)
                    /9bXBegwkXqu77ttg1H2zNptqxcGE6xDjLfnManLdL_4\.js/i,
                ];
                
                console.error = (...args: unknown[]) => {
                    const message = args.join(' ');
                    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
                    if (!shouldSuppress) {
                        originalError.apply(console, args);
                    }
                };
                
                console.warn = (...args: unknown[]) => {
                    const message = args.join(' ');
                    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));
                    if (!shouldSuppress) {
                        originalWarn.apply(console, args);
                    }
                };
            }
        }
    }, []);
    
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            </Head>
            <SWRConfig value={swrConfig}>
                <SessionProvider session={extendedProps?.session}>
                    <Layout pageTranslationNamespaces={translationNamespaces}>
                        <Component {...pageProps} />
                    </Layout>
                </SessionProvider>
            </SWRConfig>
        </>
    );
}

export default appWithTranslation(App);
