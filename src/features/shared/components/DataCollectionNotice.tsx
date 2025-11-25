'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const NOTICE_STORAGE_KEY = 'dataCollectionNoticeAccepted';

interface DataCollectionNoticeProps {
  onAccept?: () => void;
}

/**
 * Data collection notice component that displays a modal/banner
 * informing users about data collection when they first visit the site.
 * Uses localStorage to remember if the user has already seen and accepted the notice.
 */
export default function DataCollectionNotice({ onAccept }: DataCollectionNoticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user has already accepted the notice
    const hasAccepted = localStorage.getItem(NOTICE_STORAGE_KEY);
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(NOTICE_STORAGE_KEY, 'true');
    setIsVisible(false);
    if (onAccept) {
      onAccept();
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        aria-hidden="true"
        onClick={handleAccept}
      />
      <div className="relative w-full max-w-2xl rounded-lg border border-amber-500/40 bg-gray-900/95 backdrop-blur-md p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Data Collection Notice
          </h3>
          <div className="space-y-4 text-gray-300 text-sm md:text-base">
            <p>
              We collect certain information when you log in to our website using Discord to provide you with our services.
            </p>
            <p>
              <strong className="text-white">Information we collect:</strong> Discord ID, email address, name, username, 
              avatar, and account activity timestamps.
            </p>
            <p>
              <strong className="text-white">How we use it:</strong> To authenticate your account, personalize your experience, 
              and provide website functionality.
            </p>
            <p>
              <strong className="text-white">Your rights:</strong> You have the right to access, correct, or delete your personal data at any time. 
              You can view your data in Settings or contact us to exercise your rights under GDPR.
            </p>
            <p>
              By continuing to use our website, you acknowledge that you have read and understood our{' '}
              <Link 
                href="/privacy" 
                className="text-amber-400 hover:text-amber-300 underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Link
            href="/privacy"
            className="rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700/50 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            Read Privacy Policy
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-md border border-amber-600 bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-500"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

