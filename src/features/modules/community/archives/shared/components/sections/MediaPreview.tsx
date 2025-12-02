import React, { useState } from 'react';
import Image from 'next/image';
import YouTubeEmbed from '../../../media/components/YouTubeEmbed';
import TwitchClipEmbed from '../../../media/components/TwitchClipEmbed';

interface ImageItem { key: string; url: string }

type SectionKey = 'images' | 'video' | 'twitch' | 'replay' | 'game' | 'text';

interface MediaPreviewProps {
  images: ImageItem[];
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  videoUrl?: string;
  twitchUrl?: string;
  replayName?: string;
  textPreview?: string;
  sectionOrder: SectionKey[];
  onReorderSections: (fromIndex: number, toIndex: number) => void;
  onRemoveImage?: (index: number) => void;
  onRemoveReplay?: () => void;
}

export default function MediaPreview({
  images,
  onReorderImages,
  videoUrl,
  twitchUrl,
  replayName,
  textPreview,
  sectionOrder,
  onReorderSections,
  onRemoveImage,
  onRemoveReplay,
}: MediaPreviewProps) {
  const [draggingSectionIdx, setDraggingSectionIdx] = useState<number | null>(null);
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState<number | null>(null);
  const [draggingImageIdx, setDraggingImageIdx] = useState<number | null>(null);
  const [dragOverImageIdx, setDragOverImageIdx] = useState<number | null>(null);

  const handleSectionDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingSectionIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'section');
  };
  const handleSectionDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverSectionIdx(index);
  };
  const handleSectionDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingSectionIdx !== null && draggingSectionIdx !== index) {
      onReorderSections(draggingSectionIdx, index);
    }
    setDraggingSectionIdx(null);
    setDragOverSectionIdx(null);
  };
  const handleSectionDragEnd = () => {
    setDraggingSectionIdx(null);
    setDragOverSectionIdx(null);
  };

  const handleImageDragStart = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    setDraggingImageIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'image');
  };
  const handleImageDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverImageIdx(index);
  };
  const handleImageDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingImageIdx !== null && draggingImageIdx !== index) {
      onReorderImages(draggingImageIdx, index);
    }
    setDraggingImageIdx(null);
    setDragOverImageIdx(null);
  };
  const handleImageDragEnd = () => {
    setDraggingImageIdx(null);
    setDragOverImageIdx(null);
  };

  const hasAnyMedia = images.length > 0 || !!videoUrl || !!twitchUrl || !!replayName || !!textPreview;
  if (!hasAnyMedia) return null;

  return (
    <div className="mt-8 border-t border-amber-500/20 pt-6">
      <h3 className="font-medieval-brand text-2xl mb-4 text-amber-400">Live Preview</h3>

      <div className="space-y-6">
        {sectionOrder.map((section, idx) => {
          const hasContent =
            (section === 'images' && images.length > 0) ||
            (section === 'video' && !!videoUrl) ||
            (section === 'twitch' && !!twitchUrl) ||
            (section === 'replay' && !!replayName) ||
            (section === 'text' && !!textPreview);

          if (!hasContent) return null;

          return (
            <div
              key={section + idx}
              className={`relative rounded-lg ${dragOverSectionIdx === idx ? 'ring-2 ring-amber-400' : ''}`}
              draggable
              onDragStart={(e) => handleSectionDragStart(idx, e)}
              onDragOver={(e) => handleSectionDragOver(idx, e)}
              onDrop={(e) => handleSectionDrop(idx, e)}
              onDragEnd={handleSectionDragEnd}
            >

              {section === 'images' && images.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((img, i) => (
                    <div key={img.key} className="relative group border border-amber-500/30 rounded-lg overflow-hidden">
                      <div
                        className={`absolute inset-0 ${images.length > 1 ? 'cursor-move' : ''}`}
                        draggable={images.length > 1}
                        onDragStart={(e) => handleImageDragStart(i, e)}
                        onDragOver={(e) => handleImageDragOver(i, e)}
                        onDrop={(e) => handleImageDrop(i, e)}
                        onDragEnd={handleImageDragEnd}
                      />
                      <Image 
                        src={img.url} 
                        alt={`preview-${i}`} 
                        width={800} 
                        height={600} 
                        className={`w-full h-auto max-h-96 object-contain ${dragOverImageIdx === i ? 'ring-2 ring-indigo-400' : ''}`}
                        // Unoptimized for Firebase Storage URLs: Next.js cannot optimize authenticated external URLs
                        unoptimized={img.url.includes('firebasestorage.googleapis.com')}
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onRemoveImage && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onRemoveImage(i); }}
                            className="bg-red-700/80 hover:bg-red-600 text-white text-xs px-2 py-1 rounded border border-red-400/50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section === 'video' && videoUrl && (
                <div className="relative bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-2">
                  <YouTubeEmbed url={videoUrl} title="Preview Video" />
                </div>
              )}

              {section === 'twitch' && twitchUrl && (
                <div className="relative bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-2">
                  <TwitchClipEmbed url={twitchUrl} title="Preview Twitch Clip" />
                </div>
              )}

              {section === 'replay' && replayName && (
                <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 text-gray-300 flex items-center justify-between">
                  <div>
                    Replay selected: <span className="text-amber-400">{replayName}</span>
                  </div>
                  {onRemoveReplay && (
                    <button
                      type="button"
                      onClick={onRemoveReplay}
                      className="bg-red-700/80 hover:bg-red-600 text-white text-xs px-3 py-1 rounded border border-red-400/50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}

              {section === 'text' && textPreview && (
                <div className="prose prose-invert max-w-none">
                  <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{textPreview}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}




