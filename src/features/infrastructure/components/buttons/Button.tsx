import React from 'react';
import { cn } from '@/features/infrastructure/utils/className';

type BaseButtonProps = {
    variant?: 'primary' | 'secondary' | 'ghost' | 'amber' | 'success' | 'danger';
    size?: 'sm' | 'md' | 'lg';
};

type ButtonAsButton = BaseButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: 'button';
};

type ButtonAsLink = BaseButtonProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    as: 'a';
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    ({ className = '', variant = 'amber', size = 'md', as: Component = 'button', ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

        const variants = {
            primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm font-bold",
            secondary: "bg-gray-200 border border-gray-300 text-gray-900 hover:bg-gray-300 shadow-sm",
            ghost: "hover:bg-black/20 hover:text-amber-300",
            amber: "bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 hover:border-amber-400/50 backdrop-blur-sm shadow-sm",
            success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
            danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-9 px-4 py-2 text-sm",
            lg: "h-10 px-8 text-base"
        };

        const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

        if (Component === 'a') {
            return (
                <a
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    className={combinedClassName}
                    {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                />
            );
        }
        return (
            <button
                ref={ref as React.Ref<HTMLButtonElement>}
                className={combinedClassName}
                {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            />
        );
    }
);

Button.displayName = "Button";

export default Button;

