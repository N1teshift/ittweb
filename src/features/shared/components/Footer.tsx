import React from 'react';

/**
 * Footer component containing the bottom section of the layout.
 * Includes copyright information and any footer content.
 *
 * @returns A React element representing the footer.
 */
export default function Footer() {
    return (
        <footer className="bg-black/30 backdrop-blur-sm border-t border-amber-500/30 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-400 text-sm">
                    <p>&copy; 2024 Island Troll Tribes. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
