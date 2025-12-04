import React from 'react';
import { TranslationNamespaceContext } from '../../lib';
import Header from './Header';
import { Footer, DataCollectionNotice } from '@/features/modules/shared/components';

interface LayoutProps {
    children?: React.ReactNode;
    pageTranslationNamespaces?: string | string[];
}

/**
 * A layout component that wraps page content with a top navigation bar and provides translation context.
 * Includes navigation, search, and user login functionality.
 *
 * @param props The component props.
 * @param props.children The content to be rendered within the layout.
 * @param props.pageTranslationNamespaces Optional. Namespace(s) required for the page content. Defaults to ["common"].
 * @returns A React element representing the page layout with navigation.
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
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <Header />
                
                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>

                <Footer />
                <DataCollectionNotice />
            </div>
        </TranslationNamespaceContext.Provider>
    );
}

