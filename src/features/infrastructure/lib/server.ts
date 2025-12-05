/**
 * Server-only exports from the infrastructure library.
 * 
 * This file contains exports that should ONLY be used in server-side code
 * (e.g., getStaticProps, getServerSideProps, API routes).
 * 
 * DO NOT import from this file in client-side components.
 * 
 * @fileoverview Server-only infrastructure utilities
 */

// Re-export getStaticProps from shared package (uses local next-i18next.config)
// Note: The shared package version uses its own config, so we keep the local version
// for ittweb-specific i18n configuration
export * from './nextjs';

