import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  guidesItems: { href: string; label: string }[];
  communityItems: { href: string; label: string }[];
  toolsItems: { href: string; label: string }[];
}

/**
 * Mobile navigation menu component.
 * Displays navigation links in a collapsible menu for mobile devices.
 */
export function MobileMenu({ 
  isOpen, 
  onClose, 
  guidesItems, 
  communityItems, 
  toolsItems 
}: MobileMenuProps) {
  const { data: session, status } = useSession();
  const [guidesDropdownOpen, setGuidesDropdownOpen] = React.useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = React.useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/50 backdrop-blur-sm border-t border-amber-500/30">
        <Link 
          href="/" 
          className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg" 
          onClick={onClose}
        >
          Home
        </Link>
        
        {/* Guides Dropdown */}
        <div>
          <button
            onClick={() => setGuidesDropdownOpen(!guidesDropdownOpen)}
            className="font-medieval-brand-hover w-full text-left px-3 py-2 rounded-md text-lg flex items-center justify-between"
            aria-expanded={guidesDropdownOpen}
            aria-label="Guides menu"
          >
            Guides
            <svg 
              className={`w-4 h-4 transition-transform ${guidesDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {guidesDropdownOpen && (
            <div className="pl-4 space-y-1" role="menu">
              {guidesItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-300 hover:text-amber-400 rounded-md text-base"
                  onClick={() => {
                    onClose();
                    setGuidesDropdownOpen(false);
                  }}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Community Dropdown */}
        <div>
          <button
            onClick={() => setCommunityDropdownOpen(!communityDropdownOpen)}
            className="font-medieval-brand-hover w-full text-left px-3 py-2 rounded-md text-lg flex items-center justify-between"
            aria-expanded={communityDropdownOpen}
            aria-label="Community menu"
          >
            Community
            <svg 
              className={`w-4 h-4 transition-transform ${communityDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {communityDropdownOpen && (
            <div className="pl-4 space-y-1" role="menu">
              {communityItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-300 hover:text-amber-400 rounded-md text-base"
                  onClick={() => {
                    onClose();
                    setCommunityDropdownOpen(false);
                  }}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tools Dropdown */}
        <div>
          <button
            onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
            className="font-medieval-brand-hover w-full text-left px-3 py-2 rounded-md text-lg flex items-center justify-between"
            aria-expanded={toolsDropdownOpen}
            aria-label="Tools menu"
          >
            Tools
            <svg 
              className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {toolsDropdownOpen && (
            <div className="pl-4 space-y-1" role="menu">
              {toolsItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-300 hover:text-amber-400 rounded-md text-base"
                  onClick={() => {
                    onClose();
                    setToolsDropdownOpen(false);
                  }}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link 
          href="/development" 
          className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg" 
          onClick={onClose}
        >
          Development
        </Link>
        <Link 
          href="/download" 
          className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg" 
          onClick={onClose}
        >
          Download
        </Link>
        
        {status === 'authenticated' && (
          <Link 
            href="/settings" 
            className="font-medieval-brand-hover block px-3 py-2 rounded-md text-lg flex items-center gap-2" 
            onClick={onClose}
          >
            {session?.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-6 h-6 rounded-full" 
              />
            )}
            <span>{session?.user?.name || 'User'}</span>
          </Link>
        )}
      </div>
    </div>
  );
}


