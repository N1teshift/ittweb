import React from 'react';
import Link from 'next/link';

/**
 * Header component containing the top navigation bar.
 * Includes brand logo, navigation links, and mobile menu.
 *
 * @returns A React element representing the header navigation.
 */
export default function Header() {
    return (
        <header className="bg-black/30 backdrop-blur-sm border-b border-amber-500/30 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="font-medieval-brand text-xl">
                                Island Troll Tribes
                            </h1>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex space-x-8">
                        <Link href="/" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                            Home
                        </Link>
                        <Link href="/guides" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                            Guides
                        </Link>
                        <Link href="/archives" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                            Archives
                        </Link>
                        <Link href="/development" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                            Development
                        </Link>
                        <Link href="/tools" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                            Tools
                        </Link>
                        <Link href="/download" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                            Download
                        </Link>
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-gray-300 hover:text-amber-400 p-2 rounded-md">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

                                {/* Mobile Navigation Menu */}
                    <div className="md:hidden hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/50 backdrop-blur-sm">
                            <Link href="/" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg">
                                Home
                            </Link>
                            <Link href="/guides" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg">
                                Guides
                            </Link>
                            <Link href="/archives" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg">
                                Archives
                            </Link>
                            <Link href="/development" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg">
                                Development
                            </Link>
                            <Link href="/tools" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg">
                                Tools
                            </Link>
                            <Link href="/download" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg">
                                Download
                            </Link>
                        </div>
                    </div>
        </header>
    );
}
