import { useTranslation } from 'next-i18next';
import { useTranslationNamespace } from '../../lib';
import { TFunction, TOptions, i18n as I18nInstanceType } from 'i18next'; // Import TOptions and i18n for type
import { createComponentLogger } from '@/features/infrastructure/logging';

interface FallbackTranslationResponse {
  t: TFunction;
  i18n: I18nInstanceType; // Use the imported i18n type
  ready: boolean;
}

/**
 * Custom hook that provides a translation function (`t`) similar to `useTranslation` from `next-i18next`,
 * but with a fallback mechanism.
 * It first attempts to translate a key using the primary namespace(s) defined by `useTranslationNamespace`.
 * If the key is not found (indicated by the translation being identical to the key), 
 * it iterates through the specified namespaces to find a translation.
 *
 * @returns An object containing:
 *   - `t`: The translation function with fallback logic.
 *   - `i18n`: The i18next instance.
 *   - `ready`: Boolean indicating if translations are loaded.
 */
export function useFallbackTranslation(namespaces?: string | string[]): FallbackTranslationResponse { 
    const logger = createComponentLogger('useFallbackTranslation');
    const { translationNs } = useTranslationNamespace(); 
    
    // Use provided namespaces or fall back to context
    const effectiveNamespaces = namespaces || translationNs;
    
    // Log what we're getting (debug level - hidden by default)
    logger.debug('Translation setup', { 
        providedNamespaces: namespaces,
        contextTranslationNs: translationNs,
        effectiveNamespaces 
    });
    
    // Use the first namespace as default, rest as fallbacks
    const defaultNS = Array.isArray(effectiveNamespaces) ? effectiveNamespaces[0] : effectiveNamespaces;
    const fallbackNS = Array.isArray(effectiveNamespaces) ? effectiveNamespaces.slice(1) : [];
    
    logger.debug('Namespace configuration', { defaultNS, fallbackNS });
    
    // Use the default namespace for the primary translation
    const { t: primaryT, i18n, ready } = useTranslation(defaultNS); 

    const tWithFallback = ((key: string | string[], tOptions?: TOptions) => {
        if (Array.isArray(key)) {
            return primaryT(key, tOptions);
        }

        let translation: string = primaryT(key, tOptions) as string; // Assume string, cast if necessary

        // Log the fallback process (debug level - hidden by default)
        logger.debug('Translation lookup', { 
            key, 
            initialTranslation: translation, 
            fallbackNS 
        });

        // This condition `translation === key` is a common way to check for untranslated keys,
        // but it fails if a translation legitimately equals its key.
        // A more robust solution might involve `i18n.exists(key, { ns: nsToTry })` before calling `primaryT`,
        // but it adds more calls. For now, proceed with the simpler check.
        if (translation === key) {
            logger.debug('Translation not found in primary namespace, trying fallbacks', { fallbackNS });
            
            for (let i = 0; i < fallbackNS.length; i++) {
                const nsToTry = fallbackNS[i];
                // Use i18n.t directly for fallback translations to avoid namespace binding issues
                const specificNsTranslation: string = i18n.t(key, { ns: nsToTry, ...tOptions }) as string;

                logger.debug('Trying fallback namespace', { 
                    namespace: nsToTry, 
                    result: specificNsTranslation 
                });

                if (specificNsTranslation !== key) {
                    translation = specificNsTranslation;
                    logger.debug('Translation found in fallback namespace', { 
                        namespace: nsToTry, 
                        translation 
                    });
                    break; 
                }
            }
        }
        return translation;
    }) as TFunction; 

    return { t: tWithFallback, i18n, ready };
} 

