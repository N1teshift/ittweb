import Image from 'next/image';

type Props = {
  slug: string;
  name: string;
  width?: number;
  height?: number;
  className?: string;
};

export default function ClassModel({ slug, name, width = 512, height = 512, className = '' }: Props) {
  return (
    <div className={`relative w-full rounded-lg border border-amber-500/30 bg-black/30 overflow-hidden ${className}`}>
      <div className="relative mx-auto" style={{ width, height }}>
        <Image
          src={`/class-models/${slug}.png`}
          alt={`${name} model`}
          width={width}
          height={height}
          className="object-contain"
        />
      </div>
    </div>
  );
}



