import type { NextApiRequest } from 'next';
import { createPostHandler } from '@/features/infrastructure/api';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { PerformanceMetric } from '@/features/infrastructure/monitoring/performance';

const logger = createComponentLogger('api/analytics/performance');

/**
 * POST /api/analytics/performance - Accept performance metrics
 * 
 * This endpoint receives performance metrics from client-side monitoring.
 * Metrics are sent via sendBeacon with a JSON string as the body (content-type: text/plain).
 * 
 * Currently logs metrics in development. Future enhancement: store in Firestore
 * for analytics dashboards.
 */
export default createPostHandler<{ received: boolean }>(
  async (req: NextApiRequest) => {
    // sendBeacon sends JSON.stringify(metric) as text/plain
    // Next.js body parser should handle text/plain and convert it to a string
    let metric: PerformanceMetric | null = null;
    
    try {
      // Handle both string (from sendBeacon text/plain) and parsed object formats
      const body = req.body;
      
      if (typeof body === 'string') {
        metric = JSON.parse(body) as PerformanceMetric;
      } else if (typeof body === 'object' && body !== null) {
        metric = body as PerformanceMetric;
      }

      // Validate metric structure
      if (metric && 
          typeof metric.name === 'string' && 
          typeof metric.value === 'number' && 
          typeof metric.unit === 'string' && 
          typeof metric.timestamp === 'number') {
        // Log in development for debugging
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Performance metric received', {
            name: metric.name,
            value: metric.value,
            unit: metric.unit,
            timestamp: new Date(metric.timestamp).toISOString(),
          });
        }

        // Future: Store in Firestore for analytics
        // const db = getFirestoreAdmin();
        // await db.collection('performanceMetrics').add({
        //   ...metric,
        //   receivedAt: serverTimestamp(),
        // });

        return { received: true };
      }
      
      // Silently handle invalid format - this is fire-and-forget analytics
      return { received: false };
    } catch {
      // Silently handle parsing errors - this is fire-and-forget analytics
      // Errors are expected if the endpoint isn't available, so we don't log them
      return { received: false };
    }
  },
  {
    requireAuth: false, // Public endpoint for analytics
    logRequests: false, // Don't log every beacon request to reduce noise
  }
);


