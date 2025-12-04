'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { extractTwitchClipId } from '@/features/modules/community/archives/services';

interface TwitchClipEmbedProps {
  url: string;
  title: string;
}

function buildParentParams(hostname?: string) {
  const envParents = process.env.NEXT_PUBLIC_TWITCH_PARENT
    ?.split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const parents = envParents && envParents.length > 0 ? envParents : hostname ? [hostname] : [];
  if (parents.length === 0) {
    parents.push('localhost');
  }
  return parents.map((p) => `parent=${encodeURIComponent(p)}`).join('&');
}

export default function TwitchClipEmbed({ url, title }: TwitchClipEmbedProps) {
  const clipId = useMemo(() => extractTwitchClipId(url), [url]);
  const [hostname, setHostname] = useState<string>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname || 'localhost');
    }
  }, []);

  const embedUrl = useMemo(() => {
    if (!clipId || !hostname) return null;
    const parentQuery = buildParentParams(hostname);
    return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(clipId)}&${parentQuery}&autoplay=false`;
  }, [clipId, hostname]);

  if (!clipId) {
    return (
      <div className="text-sm text-red-300">
        Unable to load Twitch clip. Invalid clip URL.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-amber-500/30 bg-black/40">
      {embedUrl ? (
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={title}
          allowFullScreen
          allow="clipboard-write; encrypted-media; picture-in-picture"
          className="h-[360px] w-full"
          scrolling="no"
          loading="lazy"
        ></iframe>
      ) : (
        <div className="flex h-[360px] items-center justify-center text-gray-300">
          Loading Twitch clip...
        </div>
      )}
    </div>
  );
}



