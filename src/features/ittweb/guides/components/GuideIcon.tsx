import Image from 'next/image';
import { useMemo } from 'react';
import { getDefaultIconPath, ITTIconCategory, ITTIconState } from '@/features/ittweb/guides/utils/iconUtils';
import { resolveExplicitIcon } from '@/features/ittweb/guides/utils/iconMap';

type GuideIconProps = {
  category: ITTIconCategory;
  name: string;
  size?: number;
  state?: ITTIconState;
  className?: string;
  src?: string; // explicit override (absolute like /icons/itt/...)
};

export default function GuideIcon({ category, name, size = 48, state, className, src: srcOverride }: GuideIconProps) {
  // Priority: 1. srcOverride, 2. explicit mapping, 3. default fallback
  const explicit = useMemo(() => resolveExplicitIcon(category, name), [category, name]);
  const iconSrc = useMemo(() => {
    if (srcOverride) return srcOverride;
    if (explicit) return explicit;
    return getDefaultIconPath();
  }, [srcOverride, explicit]);

  const alt = `${name} icon`;

  return (
    <Image
      src={iconSrc}
      alt={alt}
      width={size}
      height={size}
      unoptimized={true}
      className={className}
    />
  );
}


