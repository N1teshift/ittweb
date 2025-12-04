import React from 'react';
import { cn } from '@/features/infrastructure/utils/className';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'medieval';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', ...props }, ref) => {

        const baseStyles = "rounded-lg border transition-all duration-200";

        const variants = {
            default: "bg-white border-gray-200 text-gray-900 shadow-sm",
            glass: "bg-white/60 border-gray-200/50 backdrop-blur-md text-gray-900 shadow-sm",
            medieval: "card-medieval-hover text-gray-200"
        };

        const combinedClassName = cn(baseStyles, variants[variant], className);

        return (
            <div
                ref={ref}
                className={combinedClassName}
                {...props}
            />
        );
    }
);

Card.displayName = "Card";

export default Card;

