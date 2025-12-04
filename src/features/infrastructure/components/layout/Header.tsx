import React, { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { DropdownMenu } from '../navigation/DropdownMenu';
import { MobileMenu } from '../navigation/MobileMenu';

/**
 * Header component containing the top navigation bar.
 * Includes brand logo, navigation links, and mobile menu.
 *
 * @returns A React element representing the header navigation.
 */

export default function Header() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const guidesItems = [
        { href: '/guides/troll-classes', label: 'Troll Classes' },
        { href: '/guides/abilities', label: 'Abilities' },
        { href: '/guides/items', label: 'Items' },
        { href: '/guides/units', label: 'Units' },
    ];

    const communityItems = [
        { href: '/players', label: 'Players' },
        { href: '/standings', label: 'Standings' },
    ];

    const toolsItems = [
        { href: '/classes', label: 'Class Statistics' },
        { href: '/analytics/classes', label: 'Analytics Classes' },
        { href: '/analytics/meta', label: 'Meta Statistics' },
        { href: '/tools/duel-simulator', label: 'Duel Simulator' },
        { href: '/tools/map-analyzer', label: 'Map Analyzer' },
        { href: '/tools/icon-mapper', label: 'Icon Mapper' },
    ];

    return (
        <header className="header-glass sticky top-0 z-50">
            <div className="container-responsive">
                <div className="flex justify-between items-center h-16">
                    {/* Left side: Mobile menu button on mobile, Navigation Links on desktop */}
                    <div className="flex items-center">
                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-300 hover:text-amber-400 p-2 rounded-md"
                                aria-expanded={mobileMenuOpen}
                                aria-label="Toggle mobile menu"
                            >
                                <svg 
                                    className="h-6 w-6" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                        {/* Navigation Links */}
                        <nav className="hidden md:flex space-x-8 items-center">
                            <Link href="/" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                                Home
                            </Link>
                            <DropdownMenu label="Guides" items={guidesItems} />
                            <DropdownMenu label="Community" items={communityItems} />
                            <DropdownMenu label="Tools" items={toolsItems} />
                            <Link href="/development" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                                Development
                            </Link>
                            <Link href="/download" className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg">
                                Download
                            </Link>
                        </nav>
                    </div>

                    {/* Right side: Auth / Profile */}
                    <div className="flex items-center gap-3">
                        {status === 'authenticated' ? (
                            <>
                                <Link href="/settings" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                                    {session?.user?.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-8 h-8 rounded-full" />
                                    )}
                                    <span className="text-sm text-gray-200 max-w-[12rem] truncate">{session?.user?.name || 'User'}</span>
                                </Link>
                                <button 
                                    onClick={() => signOut()} 
                                    className="px-3 py-2 text-sm rounded-md bg-amber-600 hover:bg-amber-500 text-white"
                                    aria-label="Sign out"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => signIn('discord')} 
                                className="px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
                                aria-label="Sign in with Discord"
                            >
                                Sign in with Discord
                            </button>
                        )}
                    </div>
                </div>
            </div>

                {/* Mobile Navigation Menu */}
                <MobileMenu
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    guidesItems={guidesItems}
                    communityItems={communityItems}
                    toolsItems={toolsItems}
                />
        </header>
    );
}

