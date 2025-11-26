import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

/**
 * Header component containing the top navigation bar.
 * Includes brand logo, navigation links, and mobile menu.
 *
 * @returns A React element representing the header navigation.
 */
function DropdownMenu({ label, items, className = '' }: { label: string; items: { href: string; label: string }[]; className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                className="font-medieval-brand-hover px-3 py-2 rounded-md text-lg flex items-center gap-1"
            >
                {label}
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-1 bg-black/90 backdrop-blur-sm border border-amber-500/30 rounded-lg shadow-xl min-w-[180px] z-50"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-1">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-4 py-2 text-gray-300 hover:bg-amber-500/20 hover:text-amber-400 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [guidesDropdownOpen, setGuidesDropdownOpen] = useState(false);
    const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
    const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

    const guidesItems = [
        { href: '/guides/troll-classes', label: 'Troll Classes' },
        { href: '/guides/abilities', label: 'Abilities' },
        { href: '/guides/items', label: 'Items' },
        { href: '/guides/units', label: 'Units' },
    ];

    const communityItems = [
        { href: '/archives', label: 'Archives' },
        { href: '/scheduled-games', label: 'Scheduled Games' },
        { href: '/players', label: 'Players' },
    ];

    const toolsItems = [
        { href: '/tools/duel-simulator', label: 'Duel Simulator' },
        { href: '/tools/map-analyzer', label: 'Map Analyzer' },
        { href: '/tools/icon-mapper', label: 'Icon Mapper' },
    ];

    return (
        <header className="bg-black/30 backdrop-blur-sm border-b border-amber-500/30 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
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

                    {/* Auth / Profile */}
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
                                <button onClick={() => signOut()} className="px-3 py-2 text-sm rounded-md bg-amber-600 hover:bg-amber-500 text-white">
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <button onClick={() => signIn('discord')} className="px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-500 text-white">
                                Sign in with Discord
                            </button>
                        )}
                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-300 hover:text-amber-400 p-2 rounded-md"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/50 backdrop-blur-sm border-t border-amber-500/30">
                            <Link href="/" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <div>
                                <button
                                    onClick={() => setGuidesDropdownOpen(!guidesDropdownOpen)}
                                    className="font-medieval-brand-hover w-full text-left px-3 py-2 rounded-md text-lg flex items-center justify-between"
                                >
                                    Guides
                                    <svg className={`w-4 h-4 transition-transform ${guidesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {guidesDropdownOpen && (
                                    <div className="pl-4 space-y-1">
                                        {guidesItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="block px-3 py-2 text-gray-300 hover:text-amber-400 rounded-md text-base"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    setGuidesDropdownOpen(false);
                                                }}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <button
                                    onClick={() => setCommunityDropdownOpen(!communityDropdownOpen)}
                                    className="font-medieval-brand-hover w-full text-left px-3 py-2 rounded-md text-lg flex items-center justify-between"
                                >
                                    Community
                                    <svg className={`w-4 h-4 transition-transform ${communityDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {communityDropdownOpen && (
                                    <div className="pl-4 space-y-1">
                                        {communityItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="block px-3 py-2 text-gray-300 hover:text-amber-400 rounded-md text-base"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    setCommunityDropdownOpen(false);
                                                }}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <button
                                    onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                                    className="font-medieval-brand-hover w-full text-left px-3 py-2 rounded-md text-lg flex items-center justify-between"
                                >
                                    Tools
                                    <svg className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {toolsDropdownOpen && (
                                    <div className="pl-4 space-y-1">
                                        {toolsItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="block px-3 py-2 text-gray-300 hover:text-amber-400 rounded-md text-base"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    setToolsDropdownOpen(false);
                                                }}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Link href="/development" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg" onClick={() => setMobileMenuOpen(false)}>
                                Development
                            </Link>
                            <Link href="/download" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg" onClick={() => setMobileMenuOpen(false)}>
                                Download
                            </Link>
                            {status === 'authenticated' && (
                                <Link href="/settings" className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    {session?.user?.image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={session.user.image} alt={session.user.name || 'User'} className="w-6 h-6 rounded-full" />
                                    )}
                                    <span>{session?.user?.name || 'User'}</span>
                                </Link>
                            )}
                            <Link
                                href="/test/create-game"
                                className="block mt-3 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md text-base text-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Create Game
                            </Link>
                        </div>
                    </div>
                )}
        </header>
    );
}
