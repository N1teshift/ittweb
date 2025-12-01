#!/usr/bin/env node

/**
 * Test script to verify console filtering patterns work correctly
 */

// Test patterns from the _app.tsx file
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

// Test messages from the user's browser logs
const testMessages = [
    "https://vercel.live/_next-live/feedback/feedback.html?dpl=dpl_9WTsfv34RLdo5FtSZbthvr8JXwxv gavo išskaidytą slapuką arba saugyklos priėjimą, nes jis buvo įkeltas trečiosios šalies kontekste, o dinaminis būsenos skaidymas yra įjungtas.",
    "content-script-start.js:4262:9",
    "Nepavyko įkelti <script> su ištekliumi „https://www.googletagmanager.com/gtag/js?l=dataLayer&id=G-N6X8N3S24S“. ittweb-git-staging-n1teshifts-projects.vercel.app:1:1",
    "Funkcionalumo nuostatas: praleidžiamas nepalaikomas funkcionalumas „clipboard-write“. framework-b9fd9bcc3ecde907.js:1:3338",
    "Funkcionalumo nuostatas: praleidžiamas nepalaikomas funkcionalumas „encrypted-media“. framework-b9fd9bcc3ecde907.js:1:3338",
    "Funkcionalumo nuostatas: praleidžiamas nepalaikomas funkcionalumas „picture-in-picture“. framework-b9fd9bcc3ecde907.js:1:3338",
    "Content-Security-Policy: Couldn't process unknown directive 'require-trusted-types-for' rvZwslBfJPw",
    "„https://www.youtube-nocookie.com/embed/rvZwslBfJPw?rel=0&modestbranding=1&enablejsapi=0&fs=0&iv_load_policy=3&playsinline=1&showinfo=0“ gavo išskaidytą slapuką arba saugyklos priėjimą, nes jis buvo įkeltas trečiosios šalies kontekste, o dinaminis būsenos skaidymas yra įjungtas.",
    "unreachable code after return statement 9bXBegwkXqu77ttg1H2zNptqxcGE6xDjLfnManLdL_4.js:7767:8285",
    "⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.",
    "WEBGL_debug_renderer_info is deprecated in Firefox and will be removed. Please use RENDERER. player-core-base-2b671b16d67c24859970.js:1:300337",
    "Amazon IVS Player SDK 1.47.0-rc.3.1 amazon-ivs-wasmworker.min-d93ef086db8694d73a04.js:1:49847",
    "MediaCapabilities: codec string is empty or undefined: <empty string> amazon-ivs-wasmworker.min-d93ef086db8694d73a04.js:1:100739",
];

console.log('Testing console filtering patterns...\n');

let matchedCount = 0;
let totalTests = testMessages.length;

testMessages.forEach((message, index) => {
    const shouldSuppress = suppressPatterns.some(pattern => pattern.test(message));

    if (shouldSuppress) {
        matchedCount++;
        console.log(`✅ MATCHED (${index + 1}): ${message.substring(0, 80)}${message.length > 80 ? '...' : ''}`);
    } else {
        console.log(`❌ NOT MATCHED (${index + 1}): ${message.substring(0, 80)}${message.length > 80 ? '...' : ''}`);
    }
});

console.log(`\nResults: ${matchedCount}/${totalTests} messages would be filtered out.`);
console.log(`Success rate: ${((matchedCount / totalTests) * 100).toFixed(1)}%`);
