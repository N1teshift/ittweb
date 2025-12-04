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
import { Layout } from "@/features/infrastructure/components";
import { Logger } from "@/features/infrastructure/logging";
import { initializeErrorTracking, initializePerformanceMonitoring } from "@/features/infrastructure/monitoring";
import { swrConfig } from "@/features/infrastructure/lib";

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
            
            // Filter known third-party script errors in development and production
            // These errors are harmless but clutter the console
            const isDevelopment = process.env.NODE_ENV === 'development';
            const isProduction = process.env.NODE_ENV === 'production';

            // In production, only suppress the most critical/annoying logs
            const shouldFilterLogs = isDevelopment || (isProduction && !process.env.DISABLE_PRODUCTION_LOG_FILTERING);
                const originalError = console.error;
                const originalWarn = console.warn;
                
                // Patterns for errors/warnings to suppress
                const suppressPatterns = [
                    // Google Ads tracking errors
                    /Cross-Origin Request Blocked.*googleads\.g\.doubleclick\.net/i,
                    /googleads\.g\.doubleclick\.net/i,
                    /doubleclick\.net/i,
                    // YouTube cookie warnings (comprehensive patterns)
                    /Cookie.*__Secure-YEC.*has been rejected/i,
                    /Cookie.*LAST_RESULT_ENTRY_KEY.*will soon be rejected/i,
                    /Cookie.*will soon be rejected.*Partitioned/i,
                    /Cookie.*has been rejected/i,
                    /Cookie.*will soon be rejected/i,
                    // Feature Policy warnings (deprecated API, harmless) - including Lithuanian translations
                    /Feature Policy: Skipping unsupported feature name/i,
                    /Funkcionalumo nuostatas: praleidžiamas nepalaikomas funkcionalumas/i,
                    // CSP warnings about unknown directives (harmless)
                    /Content-Security-Policy: Couldn't process unknown directive/i,
                    /require-trusted-types-for/i,
                    // Vercel Live feedback third-party context warnings
                    /vercel\.live.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
                    /https:\/\/vercel\.live\/_next-live\/feedback\/feedback\.html.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
                    // YouTube third-party context warnings (expected behavior)
                    /Partitioned cookie or storage access was provided.*youtube/i,
                    /gavo išskaidytą slapuką arba saugyklos priėjimą.*youtube/i,
                    /www\.youtube-nocookie\.com.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
                    /youtube\.com.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
                    // Twitch third-party context warnings (expected behavior)
                    /gavo išskaidytą slapuką arba saugyklos priėjimą.*twitch/i,
                    /clips\.twitch\.tv.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
                    /twitch\.tv.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
                    // Google Tag Manager script loading failures
                    /Nepavyko įkelti.*googletagmanager\.com.*gtag\/js/i,
                    /Failed to load.*googletagmanager\.com.*gtag\/js/i,
                    /googletagmanager\.com.*gtag\/js/i,
                    // Unreachable code warnings from minified third-party scripts (comprehensive)
                    /unreachable code after return statement/i,
                    // YouTube/Twitch script files (minified code warnings)
                    /9bXBegwkXqu77ttg1H2zNptqxcGE6xDjLfnManLdL_4\.js/i,
                    /sUOU1m3X_CK9BVAcAV_LmyW1AodswI8pVN5XxRmf9ec\.js/i,
                    /godoiXtxOBs/i,
                    /player-core-variant-b.*\.js/i,
                    /player-core-base.*\.js/i,
                    // Source map errors (development only, harmless)
                    /Source map error: request failed with status 404/i,
                    /Source map error: can't access property/i,
                    /installHook\.js\.map/i,
                    /react_devtools_backend_compact\.js\.map/i,
                    // Cookie warnings (third-party embeds)
                    /Cookie warnings/i,
                    // React Router future flag warnings (comprehensive)
                    /React Router Future Flag Warning/i,
                    /React Router will begin wrapping state updates in/i,
                    /Relative route resolution within Splat routes is changing in v7/i,
                    /v7_startTransition/i,
                    /v7_relativeSplatPath/i,
                    // WEBGL debug renderer deprecation warnings
                    /WEBGL_debug_renderer_info is deprecated in Firefox/i,
                    /WEBGL_debug_renderer_info.*deprecated/i,
                    // Feature policy unsupported features (harmless browser warnings)
                    /accelerometer.*unsupported/i,
                    /autoplay.*unsupported/i,
                    /clipboard-write.*unsupported/i,
                    /encrypted-media.*unsupported/i,
                    /gyroscope.*unsupported/i,
                    /picture-in-picture.*unsupported/i,
                    // Amazon IVS Player SDK warnings
                    /Amazon IVS Player SDK/i,
                    /MediaCapabilities: codec string is empty or undefined/i,
                    /amazon-ivs-wasmworker/i,
                    // Browser permission/feature warnings
                    /clipboard-write.*unsupported/i,
                    /encrypted-media.*unsupported/i,
                    /picture-in-picture.*unsupported/i,
                    // Generic third-party cookie/storage access warnings
                    /gavo išskaidytą slapuką arba saugyklos priėjimą.*trečiosios šalies kontekste/i,
                    /Partitioned cookie or storage access/i,
                    // Extension/script injection warnings
                    /content-script-start\.js/i,
                    /embed:.*:4126/i,
                    // Firebase/third-party initialization warnings (non-critical)
                    /Firebase Analytics/i,
                    /Analytics initialization/i,
                ];

                if (shouldFilterLogs) {
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

