import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  /** Tooltip text content */
  content: string;
  /** Child element that triggers the tooltip */
  children: React.ReactElement;
  /** Tooltip position relative to trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
}

/**
 * Tooltip component for displaying help text
 * 
 * @example
 * ```tsx
 * <Tooltip content="Click to schedule a new game">
 *   <Button>Schedule Game</Button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [showTimeout]);

  const handleMouseEnter = () => {
    if (disabled) return;
    
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  // Clone child element with event handlers
  // Type helper to safely access ref from ReactElement
  type ReactElementWithRef = React.ReactElement & {
    ref?: React.Ref<HTMLElement>;
  };
  
  const triggerElement = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Handle ref forwarding if child has ref
      const childWithRef = children as ReactElementWithRef;
      const childRef: React.Ref<HTMLElement> | undefined = childWithRef.ref;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
        (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur();
      children.props.onBlur?.(e);
    },
  });

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -mt-px border-t-amber-500/50 border-b-transparent border-l-transparent border-r-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 -mb-px border-b-amber-500/50 border-t-transparent border-l-transparent border-r-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 -ml-px border-l-amber-500/50 border-r-transparent border-t-transparent border-b-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 -mr-px border-r-amber-500/50 border-l-transparent border-t-transparent border-b-transparent',
  };

  return (
    <div className="relative inline-flex">
      {triggerElement}
      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 px-3 py-2 bg-black/95 backdrop-blur-sm text-amber-200 text-sm rounded border border-amber-500/50 whitespace-normal max-w-xs shadow-lg pointer-events-none ${positionClasses[position]}`}
        >
          {content}
          <div className={`absolute ${arrowClasses[position]}`}>
            <div className="border-4 border-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tooltip;

