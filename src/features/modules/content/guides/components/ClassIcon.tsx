import React from 'react';
import GuideIcon from './GuideIcon';
import { ITTIconCategory } from '../utils/iconUtils';

type Props = {
  slug: string;
  name: string;
  iconSrc?: string;
  size?: number; // pixels
  className?: string;
};

export default function ClassIcon({ slug, name, iconSrc, size = 56, className = '' }: Props) {
  const dimensionStyle = { width: size, height: size } as React.CSSProperties;

  const mapping: Record<string, { category: ITTIconCategory; displayName: string } | { src: string }> = {
    hunter: { src: '/icons/itt/btnforesttroll.png' },
    scout: { src: '/icons/itt/BTNTrollScout.png' },
  };

  const mapped = mapping[slug];

  return (
    <div
      className={`relative rounded-md overflow-hidden border border-amber-500/30 bg-black/40 flex items-center justify-center ${className}`}
      style={dimensionStyle}
      aria-label={`${name} icon`}
    >
      {mapped ? (
        'src' in mapped
          ? <GuideIcon category={'trolls'} name={name} size={size} src={mapped.src} />
          : <GuideIcon category={mapped.category} name={mapped.displayName} size={size} />
      ) : (
        <GuideIcon category={'trolls'} name={name} size={size} src={iconSrc} />
      )}
    </div>
  );
}



