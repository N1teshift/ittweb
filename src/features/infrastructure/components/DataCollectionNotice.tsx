'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const SESSION_DISMISS_KEY = 'dataCollectionNoticeDismissed';

/**
 * Data collection notice component that displays a non-intrusive banner
 * informing users about data collection when they log in.
 * Checks user data to see if they've already accepted the notice.
 * Only shows when user is authenticated.
 */
export default function DataCollectionNotice() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Only check if user is authenticated
    if (status === 'authenticated' && session?.discordId) {
      const checkUserData = async () => {
        try {
          setIsLoading(true);
          
          // First check if dismissed in this session
          const sessionDismissed = sessionStorage.getItem(SESSION_DISMISS_KEY);
          if (sessionDismissed === 'true') {
            setIsLoading(false);
            return;
          }

          // Then check if user has permanently accepted
          const response = await fetch('/api/user/data-notice-status');
          
          if (response.ok) {
            const data = await response.json();
            // Show notice if user hasn't accepted it yet
            if (!data.accepted) {
              setIsVisible(true);
            }
          } else {
            // If we can't fetch status, show the notice to be safe
            console.error('Failed to fetch data notice status');
            setIsVisible(true);
          }
        } catch (error) {
          // If we can't fetch user data, show the notice to be safe
          console.error('Failed to fetch user data for notice:', error);
          setIsVisible(true);
        } finally {
          setIsLoading(false);
        }
      };

      checkUserData();
    } else {
      setIsVisible(false);
      setIsLoading(false);
    }
  }, [status, session?.discordId]);

  const handleAccept = async () => {
    try {
      const response = await fetch('/api/user/accept-data-notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsVisible(false);
      } else {
        console.error('Failed to accept data notice');
        // Still hide it to avoid blocking the user
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error accepting data notice:', error);
      // Still hide it to avoid blocking the user
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    // Save dismissal to sessionStorage for this session only
    sessionStorage.setItem(SESSION_DISMISS_KEY, 'true');
    setIsVisible(false);
  };

  // Don't render until mounted, loaded, or if not visible
  if (!isMounted || isLoading || !isVisible || status !== 'authenticated') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pointer-events-none">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800/95 backdrop-blur-sm border border-amber-500/40 rounded-lg p-4 shadow-lg pointer-events-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-300">
                We collect information when you log in to provide our services. 
                View your data in{' '}
                <Link 
                  href="/settings" 
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Settings
                </Link>
                {' '}or read our{' '}
                <Link 
                  href="/privacy" 
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

