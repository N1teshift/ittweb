import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getTopHunters } from '@/features/modules/analytics-group/analytics/lib/analyticsService';

/**
 * GET /api/analytics/top-hunters - Get top hunters leaderboard
 * 
 * Query params:
 * - category: Game category filter (e.g., '2v2', '3v3')
 * - startDate: Start date filter (ISO string)
 * - endDate: End date filter (ISO string)
 * - limit: Number of results (default: 10)
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    return await getTopHunters(category, startDate, endDate, limit);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 5 minutes
    cacheControl: {
      public: true,
      maxAge: 300,
      mustRevalidate: true,
    },
  }
);

