import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getAggregateITTStats } from '@/features/modules/analytics-group/analytics/lib/analyticsService';

/**
 * GET /api/analytics/itt-stats - Get aggregate ITT statistics
 * 
 * Query params:
 * - category: Game category filter (e.g., '2v2', '3v3')
 * - startDate: Start date filter (ISO string)
 * - endDate: End date filter (ISO string)
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    return await getAggregateITTStats(category, startDate, endDate);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 5 minutes - ITT stats don't change as frequently
    cacheControl: {
      public: true,
      maxAge: 300,
      mustRevalidate: true,
    },
  }
);

