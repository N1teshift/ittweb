import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestoreAdmin } from '@/features/infrastructure/api/firebase/admin';

/**
 * Health Check Endpoint
 * 
 * Returns 200 OK if the application is healthy.
 * Checks Firebase connection and database accessibility.
 * 
 * GET /api/health
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health: {
    status: 'ok' | 'error';
    timestamp: string;
    checks: {
      database: 'ok' | 'error' | 'unknown';
    };
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
    },
  };

  // Check Firebase connection (server-side)
  try {
    const db = getFirestoreAdmin();
    // Simple read operation to verify connection
    // Using a collection that likely exists (games) with limit 1 for minimal cost
    await db.collection('games').limit(1).get();
    health.checks.database = 'ok';
  } catch {
    health.checks.database = 'error';
    health.status = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  // Health check should not be cached - it's a real-time status check
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.status(statusCode).json(health);
}


