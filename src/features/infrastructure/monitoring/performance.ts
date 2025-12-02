/**
 * Performance Monitoring
 * 
 * Tracks Core Web Vitals and custom performance metrics.
 * Integrates with Firebase Performance Monitoring if available.
 */

import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('performance');

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

let isFirebasePerfEnabled = false;
let firebasePerf: {
  trace: (name: string) => {
    start: () => void;
    stop: () => void;
    incrementMetric: (name: string, value: number) => void;
    setMetric: (name: string, value: number) => void;
  };
} | null = null;

/**
 * Initialize performance monitoring
 * Call this once during app initialization
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') {
    // Server-side: No performance monitoring
    return;
  }

  // Check for Firebase Performance
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getPerformance } = require('firebase/performance');
    const perf = getPerformance();
    if (perf) {
      isFirebasePerfEnabled = true;
      firebasePerf = perf;
    }
  } catch {
    // Firebase Performance not available
    isFirebasePerfEnabled = false;
  }

  // Track Core Web Vitals
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    trackCoreWebVitals();
  }
}

/**
 * Check if a PerformanceObserver entry type is supported
 * Returns true if supported, false if explicitly not supported, undefined if unknown (older browsers)
 */
function isEntryTypeSupported(entryType: string): boolean | undefined {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return false;
  }

  // Check if supportedEntryTypes is available (modern browsers)
  if (
    'supportedEntryTypes' in PerformanceObserver &&
    Array.isArray(PerformanceObserver.supportedEntryTypes)
  ) {
    // Explicitly check - if in the list, it's supported; if not, it's not supported
    return PerformanceObserver.supportedEntryTypes.includes(entryType);
  }

  // For older browsers without supportedEntryTypes property, we can't know ahead of time
  // Return undefined to allow try/catch fallback
  return undefined;
}

/**
 * Track Core Web Vitals (LCP, FID, CLS)
 */
function trackCoreWebVitals(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Largest Contentful Paint (LCP)
  const lcpSupport = isEntryTypeSupported('largest-contentful-paint');
  if (lcpSupport !== false) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        const lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
        
        if (lcp > 0) {
          reportMetric('LCP', lcp, 'ms');
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // Silently fail if not supported - this is expected in some browsers
    }
  }

  // First Input Delay (FID)
  const fidSupport = isEntryTypeSupported('first-input');
  if (fidSupport !== false) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          if (fidEntry.processingStart && fidEntry.startTime) {
            const fid = fidEntry.processingStart - fidEntry.startTime;
            reportMetric('FID', fid, 'ms');
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch {
      // Silently fail if not supported - this is expected in some browsers
    }
  }

  // Cumulative Layout Shift (CLS)
  const clsSupport = isEntryTypeSupported('layout-shift');
  if (clsSupport !== false) {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShift = entry as LayoutShift;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        });
        reportMetric('CLS', clsValue, 'score');
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // Silently fail if not supported - this is expected in some browsers
    }
  }
}

/**
 * Report a performance metric
 */
export function reportMetric(name: string, value: number, unit: string = 'ms'): void {
  const metric: PerformanceMetric = {
    name,
    value,
    unit,
    timestamp: Date.now(),
  };

  // Log performance metrics at debug level
  logger.debug(`Performance metric: ${name}`, { value, unit });

  // Send to Firebase Performance if enabled
  if (isFirebasePerfEnabled && firebasePerf) {
    try {
      const trace = firebasePerf.trace(name);
      trace.setMetric(unit, value);
      trace.stop();
    } catch (e) {
      logger.warn(`Failed to send ${name} to Firebase Performance`, { 
        error: e instanceof Error ? e.message : String(e) 
      });
    }
  }

  // Send to analytics endpoint if available
  if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
    try {
      const data = JSON.stringify(metric);
      window.navigator.sendBeacon('/api/analytics/performance', data);
    } catch {
      // Analytics endpoint not available or failed
    }
  }
}

/**
 * Measure API call performance
 */
export function measureApiCall<T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return apiCall()
    .then((result) => {
      const duration = performance.now() - startTime;
      reportMetric(`API_${apiName}`, duration, 'ms');
      return result;
    })
    .catch((error) => {
      const duration = performance.now() - startTime;
      reportMetric(`API_${apiName}_ERROR`, duration, 'ms');
      throw error;
    });
}

/**
 * Create a performance trace
 */
export function createTrace(name: string): {
  start: () => void;
  stop: () => void;
  incrementMetric: (metricName: string, value: number) => void;
  setMetric: (metricName: string, value: number) => void;
} {
  if (isFirebasePerfEnabled && firebasePerf) {
    return firebasePerf.trace(name);
  }

  // Fallback trace that does nothing
  return {
    start: () => {},
    stop: () => {},
    incrementMetric: () => {},
    setMetric: () => {},
  };
}

/**
 * Check if performance monitoring is enabled
 */
export function isPerformanceMonitoringEnabled(): boolean {
  return isFirebasePerfEnabled;
}

// Type definitions for Performance API
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}


