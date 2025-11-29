/**
 * Performance Monitoring
 * 
 * Tracks Core Web Vitals and custom performance metrics.
 * Integrates with Firebase Performance Monitoring if available.
 */

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
 * Track Core Web Vitals (LCP, FID, CLS)
 */
function trackCoreWebVitals(): void {
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
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
    } catch (e) {
      console.warn('[Performance] LCP tracking not supported:', e);
    }
  }

  // First Input Delay (FID)
  if ('PerformanceObserver' in window) {
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
    } catch (e) {
      console.warn('[Performance] FID tracking not supported:', e);
    }
  }

  // Cumulative Layout Shift (CLS)
  if ('PerformanceObserver' in window) {
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
    } catch (e) {
      console.warn('[Performance] CLS tracking not supported:', e);
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

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${value}${unit}`);
  }

  // Send to Firebase Performance if enabled
  if (isFirebasePerfEnabled && firebasePerf) {
    try {
      const trace = firebasePerf.trace(name);
      trace.setMetric(unit, value);
      trace.stop();
    } catch (e) {
      console.warn(`[Performance] Failed to send ${name} to Firebase:`, e);
    }
  }

  // Send to analytics endpoint if available
  if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
    try {
      const data = JSON.stringify(metric);
      window.navigator.sendBeacon('/api/analytics/performance', data);
    } catch (e) {
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

