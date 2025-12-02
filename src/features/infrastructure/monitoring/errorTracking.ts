/**
 * Error Tracking Integration
 * 
 * Provides error tracking capabilities with optional Sentry integration.
 * If Sentry is not configured, errors are logged to console only.
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/nextjs
 * 2. Set SENTRY_DSN environment variable
 * 3. Initialize Sentry in your Next.js app (see Sentry docs)
 */


export interface ErrorContext {
  component?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

let isSentryEnabled = false;
let sentryCaptureException: ((error: Error, context?: Record<string, unknown>) => void) | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverSentry: any | null = null;
let sentryLoadPromise: Promise<void> | null = null;

/**
 * Lazy load Sentry module (server-side only)
 * Uses dynamic import to avoid module resolution errors if Sentry is not installed
 */
async function loadServerSentry(): Promise<void> {
  if (serverSentry !== null) {
    return; // Already loaded
  }

  if (sentryLoadPromise) {
    return sentryLoadPromise; // Already loading
  }

  sentryLoadPromise = (async () => {
    try {
      // Dynamic import - only evaluated when this function is called
      // @ts-expect-error - Sentry is optional, module may not exist
      const SentryModule = await import('@sentry/nextjs');
      if (SentryModule?.captureException && process.env.SENTRY_DSN) {
        serverSentry = SentryModule;
        isSentryEnabled = true;
        sentryCaptureException = (error: Error, context?: Record<string, unknown>) => {
          if (serverSentry?.captureException) {
            serverSentry.captureException(error, { extra: context });
          }
        };
      }
    } catch {
      // Sentry not installed or not configured - this is expected and OK
      serverSentry = null;
      isSentryEnabled = false;
    }
  })();

  return sentryLoadPromise;
}

/**
 * Initialize error tracking
 * Call this once during app initialization
 */
export function initializeErrorTracking(): void {
  // Check if Sentry is available
  if (typeof window !== 'undefined') {
    // Client-side: Check for Sentry in window
    const sentry = (window as unknown as { Sentry?: { captureException: typeof sentryCaptureException } }).Sentry;
    if (sentry?.captureException) {
      isSentryEnabled = true;
      const sentryInstance = sentry; // Capture for closure
      sentryCaptureException = (error: Error, context?: Record<string, unknown>) => {
        if (sentryInstance?.captureException) {
          sentryInstance.captureException(error, { extra: context });
        }
      };
    }
  } else {
    // Server-side: Lazy load Sentry asynchronously
    // Don't await - let it load in background
    const loadPromise = loadServerSentry();
    if (loadPromise) {
      loadPromise.catch(() => {
        // Silently fail if Sentry can't be loaded - this is expected if Sentry is not installed
        isSentryEnabled = false;
      }).then(() => {
        // Ensure sentryCaptureException is set if Sentry loaded successfully
        if (isSentryEnabled && !sentryCaptureException && serverSentry?.captureException) {
          sentryCaptureException = (error: Error, context?: Record<string, unknown>) => {
            if (serverSentry?.captureException) {
              serverSentry.captureException(error, { extra: context });
            }
          };
        }
      });
    }
  }
}

/**
 * Capture an error with context
 */
export function captureError(
  error: Error,
  context?: ErrorContext
): void {
  const errorContext: Record<string, unknown> = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  };

  // Add error category if available
  if (context?.category) {
    errorContext.category = context.category;
  }

  // Send to Sentry if enabled
  if (isSentryEnabled && sentryCaptureException) {
    try {
      sentryCaptureException(error, errorContext);
    } catch (err) {
      // Fallback to console if Sentry fails
      console.error('[Error Tracking] Failed to send to Sentry:', err);
      console.error('[Error]', error, errorContext);
    }
  } else if (typeof window === 'undefined' && !serverSentry) {
    // Server-side: Try to load Sentry if not already loaded
    loadServerSentry().then(() => {
      if (isSentryEnabled && sentryCaptureException) {
        try {
          sentryCaptureException(error, errorContext);
        } catch (err) {
          console.error('[Error Tracking] Failed to send to Sentry:', err);
          console.error('[Error]', error, errorContext);
        }
      } else {
        console.error('[Error]', error, errorContext);
      }
    }).catch(() => {
      // Log to console if Sentry not available
      console.error('[Error]', error, errorContext);
    });
  } else {
    // Log to console if Sentry not available
    console.error('[Error]', error, errorContext);
  }
}

/**
 * Capture a message (non-error)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): void {
  if (isSentryEnabled) {
    try {
      if (typeof window !== 'undefined') {
        const sentry = (window as unknown as { Sentry?: { captureMessage: (msg: string, level: string) => void } }).Sentry;
        if (sentry?.captureMessage) {
          sentry.captureMessage(message, level);
        }
      } else {
        // Server-side: Use lazy-loaded Sentry
        if (serverSentry?.captureMessage) {
          serverSentry.captureMessage(message, { level, extra: context });
        } else {
          // Try to load if not already loaded
          loadServerSentry().then(() => {
            if (serverSentry?.captureMessage) {
              serverSentry.captureMessage(message, { level, extra: context });
            }
          }).catch(() => {
            // Fallback to console if Sentry not available
            console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info'](`[${level.toUpperCase()}]`, message, context);
          });
        }
      }
    } catch {
      // Fallback to console
      console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info'](`[${level.toUpperCase()}]`, message, context);
    }
  } else {
    console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info'](`[${level.toUpperCase()}]`, message, context);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, username?: string): void {
  if (isSentryEnabled) {
    try {
      if (typeof window !== 'undefined') {
        const sentry = (window as unknown as { Sentry?: { setUser: (user: { id: string; email?: string; username?: string }) => void } }).Sentry;
        if (sentry?.setUser) {
          sentry.setUser({ id: userId, email, username });
        }
      } else {
        // Server-side: Use lazy-loaded Sentry
        if (serverSentry?.setUser) {
          serverSentry.setUser({ id: userId, email, username });
        } else {
          // Try to load if not already loaded
          loadServerSentry().then(() => {
            if (serverSentry?.setUser) {
              serverSentry.setUser({ id: userId, email, username });
            }
          }).catch(() => {
            // Sentry not available - silently fail
          });
        }
      }
    } catch {
      // Sentry not available
    }
  }
}

/**
 * Check if error tracking is enabled
 */
export function isErrorTrackingEnabled(): boolean {
  return isSentryEnabled;
}


