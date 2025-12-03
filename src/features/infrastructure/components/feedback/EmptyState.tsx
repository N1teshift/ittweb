import React from 'react';
import { Card } from '../containers';
import { Button } from '../buttons';

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
        <Button
          onClick={action.onClick}
          variant={action.variant === 'secondary' ? 'ghost' : 'amber'}
          aria-label={action.label}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
}

export default EmptyState;

