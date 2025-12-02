/**
 * Monitoring Infrastructure
 * 
 * Centralized exports for error tracking and performance monitoring
 */

export {
  initializeErrorTracking,
  captureError,
  captureMessage,
  setUserContext,
  isErrorTrackingEnabled,
  type ErrorContext,
} from './errorTracking';

export {
  initializePerformanceMonitoring,
  reportMetric,
  measureApiCall,
  createTrace,
  isPerformanceMonitoringEnabled,
  type PerformanceMetric,
} from './performance';


