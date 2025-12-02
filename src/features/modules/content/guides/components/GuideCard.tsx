import Link from 'next/link';
import React, { useRef } from 'react';
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

  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent navigation if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      e.preventDefault();
      return;
    }
    
    // Prevent navigation if mouse was dragged (not a simple click)
    // Also check if mouse position changed significantly
    if (isDraggingRef.current || (mouseDownPosRef.current && (
      Math.abs(e.clientX - mouseDownPosRef.current.x) > 3 ||
      Math.abs(e.clientY - mouseDownPosRef.current.y) > 3
    ))) {
      e.preventDefault();
      return;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Store initial mouse position to detect drag vs click
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Detect if user is dragging (moving mouse while holding down)
    if (mouseDownPosRef.current) {
      const deltaX = Math.abs(e.clientX - mouseDownPosRef.current.x);
      const deltaY = Math.abs(e.clientY - mouseDownPosRef.current.y);
      // If moved more than 3 pixels, treat as drag/selection, not click
      if (deltaX > 3 || deltaY > 3) {
        isDraggingRef.current = true;
      }
    }
  };

  const handleMouseUp = () => {
    // Don't immediately clean up - let click handler check first
    // Clean up after a delay to ensure click handler has run
    setTimeout(() => {
      mouseDownPosRef.current = null;
    }, 100);
  };

  return (
    <Link 
      href={href} 
      className="group block focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg"
      onClick={handleLinkClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      draggable={false}
    >
      <div
        className={
          `bg-black/40 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 hover:border-amber-400/50 transition-colors cursor-pointer ${
            className || ''
          }`
        }
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medieval-brand text-lg text-amber-400 group-hover:text-amber-300 select-text">
            <ColoredText text={title} />
          </h3>
          {icon ? <div className="flex-shrink-0 ml-3">{icon}</div> : null}
        </div>

        {description ? (
          <div className="text-gray-300 text-sm mb-3 leading-relaxed select-text">
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
              <h4 className="text-amber-300 text-sm font-semibold mb-1 select-text">{primaryTagGroup.label}</h4>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {primaryTagGroup.badges.map((b, i) => (
                <span key={i} className={`text-xs px-2 py-1 rounded select-text ${getVariantClasses(b.variant)}`}>
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
              <h4 className="text-amber-300 text-sm font-semibold mb-1 select-text">{secondaryTagGroup.label}</h4>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {secondaryTagGroup.badges.map((b, i) => (
                <span key={i} className={`text-xs px-2 py-1 rounded select-text ${getVariantClasses(b.variant)}`}>
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



