import Image from 'next/image';
import { useMemo, useState } from 'react';
import { getDefaultIconPath, ITTIconCategory, ITTIconState } from '@/features/modules/guides/utils/iconUtils';
import { resolveExplicitIcon } from '@/features/modules/guides/utils/iconMap';

type GuideIconProps = {
  category: ITTIconCategory;
  name: string;
  size?: number;
  state?: ITTIconState;
  className?: string;
  src?: string; // explicit override (absolute like /icons/itt/...)
};

export default function GuideIcon({ category, name, size = 48, state: _state, className, src: srcOverride }: GuideIconProps) {
  // Priority: 1. srcOverride, 2. explicit mapping, 3. default fallback
  const explicit = useMemo(() => resolveExplicitIcon(category, name), [category, name]);
  const initialIconSrc = useMemo(() => {
    if (srcOverride) return srcOverride;
    if (explicit) return explicit;
    return getDefaultIconPath();
  }, [srcOverride, explicit]);

  // Track if image failed to load, fallback to appropriate icon
  const [iconSrc, setIconSrc] = useState(initialIconSrc);
  const [hasErrored, setHasErrored] = useState(false);
  
  // Fallback icon for when a mapping exists but the file is missing
  const MAPPING_FALLBACK_ICON = '/icons/itt/btnselectherooff.png';
  const NO_MAPPING_FALLBACK_ICON = getDefaultIconPath(); // btncancel.png

  const handleError = () => {
    // Only fallback once to prevent infinite loops
    if (!hasErrored) {
      setHasErrored(true);
      // If there was a mapping (explicit exists), use mapping fallback
      // Otherwise, use no-mapping fallback
      const fallbackIcon = explicit ? MAPPING_FALLBACK_ICON : NO_MAPPING_FALLBACK_ICON;
      if (iconSrc !== fallbackIcon) {
        setIconSrc(fallbackIcon);
      }
    }
  };

  const alt = `${name} icon`;

  return (
    <Image
      src={iconSrc}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={handleError}
    />
  );
}


