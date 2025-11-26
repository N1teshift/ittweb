import Link from 'next/link';
import React from 'react';
import { ColoredText } from './ColoredText';

type TagVariant = 'amber' | 'blue' | 'green' | 'purple' | 'red' | 'gray';

interface TagBadge {
  label: string;
  variant?: TagVariant;
  icon?: React.ReactNode;
}

interface TagGroup {
  label?: string;
  badges: TagBadge[];
}

export interface GuideCardProps {
  href: string;
  title: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  primaryTagGroup?: TagGroup;
  secondaryTagGroup?: TagGroup;
  footer?: React.ReactNode;
  className?: string;
}

function getVariantClasses(variant: TagVariant | undefined): string {
  switch (variant) {
    case 'blue':
      return 'bg-blue-500/20 text-blue-200';
    case 'green':
      return 'bg-green-500/20 text-green-200';
    case 'purple':
      return 'bg-purple-500/20 text-purple-200';
    case 'red':
      return 'bg-red-500/20 text-red-200';
    case 'gray':
      return 'bg-gray-500/20 text-gray-200';
    case 'amber':
    default:
      return 'bg-amber-500/20 text-amber-200';
  }
}

export default function GuideCard(props: GuideCardProps) {
  const {
    href,
    title,
    icon,
    description,
    primaryTagGroup,
    secondaryTagGroup,
    footer,
    className,
  } = props;

  return (
    <Link href={href} className="group block focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg">
      <div
        className={
          `bg-black/40 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 hover:border-amber-400/50 transition-colors cursor-pointer ${
            className || ''
          }`
        }
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medieval-brand text-lg text-amber-400 group-hover:text-amber-300">
            <ColoredText text={title} />
          </h3>
          {icon ? <div className="flex-shrink-0 ml-3">{icon}</div> : null}
        </div>

        {description ? (
          <div className="text-gray-300 text-sm mb-3 leading-relaxed">
            {typeof description === 'string' ? (
              <ColoredText text={description} />
            ) : (
              description
            )}
          </div>
        ) : null}

        {primaryTagGroup && primaryTagGroup.badges?.length > 0 && (
          <div className="mb-3">
            {primaryTagGroup.label ? (
              <h4 className="text-amber-300 text-sm font-semibold mb-1">{primaryTagGroup.label}</h4>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {primaryTagGroup.badges.map((b, i) => (
                <span key={i} className={`text-xs px-2 py-1 rounded ${getVariantClasses(b.variant)}`}>
                  {b.icon ? <span className="mr-1 inline-flex items-center">{b.icon}</span> : null}
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {secondaryTagGroup && secondaryTagGroup.badges?.length > 0 && (
          <div className="mb-3">
            {secondaryTagGroup.label ? (
              <h4 className="text-amber-300 text-sm font-semibold mb-1">{secondaryTagGroup.label}</h4>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {secondaryTagGroup.badges.map((b, i) => (
                <span key={i} className={`text-xs px-2 py-1 rounded ${getVariantClasses(b.variant)}`}>
                  {b.icon ? <span className="mr-1 inline-flex items-center">{b.icon}</span> : null}
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {footer ? <div className="mt-1">{footer}</div> : null}
      </div>
    </Link>
  );
}


