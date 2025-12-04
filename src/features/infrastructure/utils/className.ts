import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes intelligently, resolving conflicts
 * and ensuring proper class ordering.
 * 
 * This utility combines clsx for conditional classes and tailwind-merge
 * to handle Tailwind class conflicts (e.g., p-4 p-6 -> p-6).
 * 
 * @example
 * ```tsx
 * cn('p-4', isActive && 'bg-blue-500', className)
 * cn('p-4 p-6') // Returns 'p-6'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

