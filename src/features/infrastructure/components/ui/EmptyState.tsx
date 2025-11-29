import React from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

/**
 * Shared empty state component for displaying when no data is available.
 * Provides consistent styling and messaging across the application.
 */
export function EmptyState({ 
  title, 
  message, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <Card variant="medieval" className={`p-8 text-center ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-amber-400 mb-2">
          {title}
        </h3>
      )}
      <p className="text-gray-400 mb-6">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={`px-6 py-2 rounded border transition-colors ${
            action.variant === 'secondary'
              ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
              : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
          }`}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </Card>
  );
}

export default EmptyState;

