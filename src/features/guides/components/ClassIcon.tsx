import React from 'react';
import Image from 'next/image';

type Props = {
  slug: string;
  name: string;
  size?: number; // pixels
  className?: string;
};

export default function ClassIcon({ slug, name, size = 56, className = '' }: Props) {
  const [failed, setFailed] = React.useState(false);
  const dimensionStyle = { width: size, height: size } as React.CSSProperties;

  return (
    <div
      className={`relative rounded-md overflow-hidden border border-amber-500/30 bg-black/40 flex items-center justify-center ${className}`}
      style={dimensionStyle}
      aria-label={`${name} icon`}
    >
      {!failed ? (
        <Image
          src={`/class-icons/${slug}.png`}
          alt={`${name} icon`}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 text-amber-300 font-medieval-brand text-xl">
          {name?.charAt(0) ?? '?'}
        </div>
      )}
    </div>
  );
}


