import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'medieval';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', ...props }, ref) => {

        const baseStyles = "rounded-lg border transition-all";

        const variants = {
            default: "bg-white border-gray-200 text-gray-900 shadow-sm",
            glass: "bg-white/60 border-gray-200/50 backdrop-blur-md text-gray-900 shadow-sm",
            medieval: "bg-black/40 backdrop-blur-sm border border-amber-500/30 text-gray-200 hover:border-amber-400/50 shadow-sm"
        };

        const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`.trim();

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

