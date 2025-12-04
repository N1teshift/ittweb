import React from 'react';
import Link from 'next/link';

/**
 * Footer component containing the bottom section of the layout.
 * Includes copyright information and any footer content.
 *
 * @returns A React element representing the footer.
 */
export default function Footer() {
    return (
        <footer className="bg-black/30 backdrop-blur-sm border-t border-amber-500/30 py-6">
            <div className="container-responsive">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-gray-400 text-sm">
                    <p>&copy; 2025 Island Troll Tribes. All rights reserved.</p>
                    <Link 
                        href="/privacy" 
                        className="link-amber underline"
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}

