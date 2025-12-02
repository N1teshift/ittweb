import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { getDefaultIconPath, ITTIconCategory, ITTIconState } from '../utils/iconUtils';
import { resolveExplicitIcon } from '../utils/iconMap';

type GuideIconProps = {
  category: ITTIconCategory;
  name: string;
  size?: number;
  state?: ITTIconState;
  className?: string;
  src?: string; // explicit override (absolute like /icons/itt/...)
};

// Helper to ensure we always have a valid icon src
function ensureValidIconSrc(src: string | undefined | null): string {
  const defaultIcon = getDefaultIconPath();
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return defaultIcon;
  }
  const trimmed = src.trim();
  // Ensure it's an absolute path (starts with /) or a valid URL
  if (!trimmed.startsWith('/') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return defaultIcon;
  }
  return trimmed;
}

export default function GuideIcon({ category, name, size = 48, state: _state, className, src: srcOverride }: GuideIconProps) {
  // Priority: 1. srcOverride, 2. explicit mapping, 3. default fallback
  // Always check for explicit mapping to determine fallback behavior
  const explicit = useMemo(() => resolveExplicitIcon(category, name), [category, name]);
  const initialIconSrc = useMemo(() => {
    // Ensure all paths are validated
    if (srcOverride) return ensureValidIconSrc(srcOverride);
    if (explicit) return ensureValidIconSrc(explicit);
    return getDefaultIconPath();
  }, [srcOverride, explicit]);

  // Track if image failed to load, fallback to appropriate icon
  const [iconSrc, setIconSrc] = useState(() => ensureValidIconSrc(initialIconSrc));
  const [hasErrored, setHasErrored] = useState(false);
  
  // Fallback icon for when a mapping exists but the file is missing
  const MAPPING_FALLBACK_ICON = '/icons/itt/btnselectherooff.png';
  const NO_MAPPING_FALLBACK_ICON = getDefaultIconPath(); // btncancel.png

  // Determine if we have a mapping (either explicit or srcOverride indicates a mapping attempt)
  const hasMapping = explicit !== null || (srcOverride !== undefined && srcOverride !== null && srcOverride !== '');

  // Reset error state when initialIconSrc changes
  useEffect(() => {
    const validSrc = ensureValidIconSrc(initialIconSrc);
    setIconSrc(validSrc);
    setHasErrored(false);
  }, [initialIconSrc]);

  const handleError = (_e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Only fallback once to prevent infinite loops
    if (!hasErrored) {
      setHasErrored(true);
      // If there was a mapping (explicit exists or srcOverride was provided), use mapping fallback
      // Otherwise, use no-mapping fallback
      const fallbackIcon = hasMapping ? MAPPING_FALLBACK_ICON : NO_MAPPING_FALLBACK_ICON;
      const validFallback = ensureValidIconSrc(fallbackIcon);
      if (iconSrc !== validFallback) {
        setIconSrc(validFallback);
      }
    }
  };

  const alt = `${name} icon`;

  // Ensure iconSrc is always valid before rendering
  const validIconSrc = ensureValidIconSrc(iconSrc);
  
  // Use unoptimized for local icon files to avoid Next.js Image optimization API issues
  // when files are missing. Small icons (48x48) don't need optimization anyway.
  const isLocalIcon = validIconSrc.startsWith('/icons/itt/');

  return (
    <Image
      src={validIconSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={handleError}
      unoptimized={isLocalIcon}
    />
  );
}



