/**
 * @deprecated This file is maintained for backward compatibility only.
 * Please use `@/features/infrastructure/logging` instead.
 * 
 * This file re-exports all logging utilities from the infrastructure logging system.
 * It will be removed in a future version once all references are migrated.
 */

// Re-export everything from infrastructure logging for backward compatibility
export {
  Logger,
  createComponentLogger,
  logError,
  logAndThrow,
  ErrorCategory,
} from '@/features/infrastructure/logging';

// Also export Logger as default for backward compatibility
export { Logger as default } from '@/features/infrastructure/logging';
