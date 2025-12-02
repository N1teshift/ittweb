import React from 'react';
import Image from 'next/image';
import YouTubeEmbed from '../../media/components/YouTubeEmbed';
import TwitchClipEmbed from '../../media/components/TwitchClipEmbed';
import type { ArchiveEntry } from '@/types/archive';
import { normalizeSectionOrder } from '@/features/modules/community/archives/shared/utils/archiveFormUtils';

type EntrySection = 'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text';

interface ArchiveMediaSectionsProps {
  entry: ArchiveEntry;
  onImageClick?: (url: string, title: string) => void;
  showText?: boolean;
  displayText?: string;
  onTextExpand?: () => void;
  shouldTruncate?: boolean;
  isExpanded?: boolean;
}

export function ArchiveMediaSections({
  entry,
  onImageClick,
  showText = true,
  displayText,
  onTextExpand,
  shouldTruncate = false,
  isExpanded = false,
}: ArchiveMediaSectionsProps) {
  const imageUrls: string[] = entry.images && entry.images.length > 0 ? entry.images : [];
  const video: string | undefined = entry.videoUrl;
  const replay: string | undefined = entry.replayUrl;

  const order: EntrySection[] = normalizeSectionOrder(entry.sectionOrder as EntrySection[] | undefined);

  return (
    <div className="space-y-4">
      {order.map((section: EntrySection, idx: number) => {
        if (section === 'images' && imageUrls.length > 0) {
          return (
            <div key={`section-images-${idx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {imageUrls.map((url: string, i: number) => (
                <div
                  key={url + i}
                  className="relative w-full rounded-lg border border-amber-500/30 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
                  onClick={() => onImageClick ? onImageClick(url, entry.title) : undefined}
                >
                  <Image
                    src={url}
                    alt={entry.title}
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-96 object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={url.includes('firebasestorage.googleapis.com')}
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 hover:opacity-100 transition-opacity">
                      Click to enlarge
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (section === 'video' && video) {
          return (
            <div key={`section-video-${idx}`}>
              <YouTubeEmbed url={video} title={entry.title} />
            </div>
          );
        }

        if (section === 'twitch' && entry.twitchClipUrl) {
          return (
            <div key={`section-twitch-${idx}`}>
              <TwitchClipEmbed url={entry.twitchClipUrl} title={entry.title} />
            </div>
          );
        }

        if (section === 'replay' && replay) {
          return (
            <div key={`section-replay-${idx}`}>
              <a
                href={replay}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download replay (.w3g)
              </a>
            </div>
          );
        }

        if (section === 'text' && showText && entry.content && entry.content.trim()) {
          return (
            <div key={`section-text-${idx}`} className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {displayText || entry.content}
                {shouldTruncate && onTextExpand && (
                  <button
                    onClick={onTextExpand}
                    className="ml-2 text-amber-400 hover:text-amber-300 underline font-medium transition-colors"
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </p>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}



