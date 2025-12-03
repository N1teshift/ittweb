import React from 'react';
import Image from 'next/image';
import { useModalAccessibility } from '@/features/infrastructure/hooks';

interface ImageModalProps {
  isOpen: boolean;
  image: { url: string; title: string } | null;
  onClose: () => void;
}

export default function ImageModal({ isOpen, image, onClose }: ImageModalProps) {
  const modalRef = useModalAccessibility({
    isOpen: isOpen && !!image,
    onClose,
    trapFocus: true,
    focusOnOpen: true,
  });

  if (!isOpen || !image) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close image modal"
          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Container */}
        <div className="relative overflow-hidden">
          <Image
            src={image.url}
            alt={image.title}
            width={1200}
            height={900}
            className="max-w-full max-h-full object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            onClick={(e) => e.stopPropagation()}
            // Unoptimized for Firebase Storage URLs: Next.js Image optimization cannot access
            // authenticated external URLs with query parameters. Images are already compressed
            // on upload (see archiveService.ts compression logic).
            unoptimized={image.url.includes('firebasestorage.googleapis.com')}
          />
        </div>
      </div>
    </div>
  );
}


