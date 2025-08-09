import Image from 'next/image';
import { useState, useMemo } from 'react';
import { getIconPath, getDisabledIconPath, getIconCandidates, ITTIconCategory, ITTIconState } from '@/features/guides/utils/iconUtils';
import { resolveExplicitIcon } from '@/features/guides/utils/iconMap';

type GuideIconProps = {
  category: ITTIconCategory;
  name: string;
  size?: number;
  state?: ITTIconState;
  className?: string;
  src?: string; // explicit override (absolute like /icons/itt/...)
};

export default function GuideIcon({ category, name, size = 48, state, className, src: srcOverride }: GuideIconProps) {
  const explicit = useMemo(() => resolveExplicitIcon(category, name), [category, name]);
  const primarySrc = useMemo(() => srcOverride || explicit || getIconPath({ category, name, state }), [category, name, state, srcOverride, explicit]);
  const disabledSrc = useMemo(() => getDisabledIconPath(category, name), [category, name]);
  const candidates = useMemo(() => getIconCandidates({ category, name, state }), [category, name, state]);
  const fallbackSrc = '/icons/itt/items/enabled/BTNYellowHerb.png';

  const [src, setSrc] = useState(primarySrc);
  const [triedDisabled, setTriedDisabled] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  const alt = `${name} icon`;

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={() => {
        // Walk through candidates first
        const currentIdx = candidates.indexOf(src);
        const nextIdx = currentIdx >= 0 ? currentIdx + 1 : 0;
        if (nextIdx < candidates.length) {
          setSrc(candidates[nextIdx]);
          return;
        }

        if (!triedDisabled) {
          setTriedDisabled(true);
          setSrc(disabledSrc);
        } else if (!triedFallback) {
          setTriedFallback(true);
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}


