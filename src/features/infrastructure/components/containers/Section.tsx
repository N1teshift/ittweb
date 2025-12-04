import React from 'react';
import { cn } from '@/features/infrastructure/utils/className';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'medieval' | 'glass' | 'minimal';
  as?: 'section' | 'div' | 'article';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = 'default', as: Component = 'section', ...props }, ref) => {
    const variants = {
      default: "bg-white rounded-lg p-6",
      medieval: "section-medieval",
      glass: "bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-lg p-6",
      minimal: "p-6",
    };

    // Type assertion needed for polymorphic component
    const ComponentWithRef = Component as React.ElementType;

    return (
      <ComponentWithRef
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);

Section.displayName = "Section";

export default Section;

