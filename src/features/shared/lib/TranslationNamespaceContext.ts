import { createContext, useContext } from 'react';

// Define the shape of your context data
interface TranslationNamespaceContextType {
  translationNs: string | string[];
  defaultNS: string; // Added for the primary namespace
  fallbackNS: string[]; // Added for fallback namespaces
}

// Create the context with a sensible default value.
// This default ('common') would be used if a component somehow
// gets rendered outside a provider, or if you want a general fallback.
export const TranslationNamespaceContext = createContext<TranslationNamespaceContextType>({
  translationNs: 'common',
  defaultNS: 'common', // Default primary namespace
  fallbackNS: [], // Default empty array for fallbacks
});

/**
 * Custom hook to access the translation namespace context.
 * Provides the `translationNs`, `defaultNS`, `fallbackNS`, and `pageTranslations` values.
 *
 * @returns The translation namespace context object.
 */
// Custom hook for easy consumption of the context
export const useTranslationNamespace = () => useContext(TranslationNamespaceContext); 