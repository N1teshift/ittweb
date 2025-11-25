import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full px-3 py-2 rounded-md
                        bg-black/40 border border-amber-500/30
                        text-gray-200 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400/50
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                        ${className}
                    `.trim()}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <Input
                ref={ref}
                type="number"
                label={label}
                error={error}
                className={className}
                {...props}
            />
        );
    }
);

NumberInput.displayName = "NumberInput";

export const SelectInput = React.forwardRef<HTMLSelectElement, {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className = '', label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
                        w-full px-3 py-2 rounded-md
                        bg-black/40 border border-amber-500/30
                        text-gray-200
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400/50
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                        ${className}
                    `.trim()}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

SelectInput.displayName = "SelectInput";

export default Input;

