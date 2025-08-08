import React from 'react';
import { TranslationNamespaceContext } from '../lib/TranslationNamespaceContext';

interface LayoutProps {
    children?: React.ReactNode;
    pageTranslationNamespaces?: string | string[];
}

/**
 * A minimal layout component that wraps page content and provides translation context.
 * Ready for future layout instructions.
 *
 * @param props The component props.
 * @param props.children The content to be rendered within the layout.
 * @param props.pageTranslationNamespaces Optional. Namespace(s) required for the page content. Defaults to ["common"].
 * @returns A React element representing the page layout.
 */
export default function Layout({ children, pageTranslationNamespaces = ["common"] }: LayoutProps) {
    const contextValue = {
        translationNs: pageTranslationNamespaces,
        defaultNS: Array.isArray(pageTranslationNamespaces)
            ? pageTranslationNamespaces[0]
            : pageTranslationNamespaces,
        fallbackNS: Array.isArray(pageTranslationNamespaces)
            ? pageTranslationNamespaces.slice(1)
            : []
    };

    return (
        <TranslationNamespaceContext.Provider value={contextValue}>
            <div className="min-h-screen">
                {children}
            </div>
        </TranslationNamespaceContext.Provider>
    );
}