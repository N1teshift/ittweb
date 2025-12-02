import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getEloHistory } from '@/features/modules/analytics-group/analytics/lib/analyticsService';

/**
 * GET /api/analytics/elo-history - Get ELO history
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const playerName = req.query.playerName as string;
    const category = req.query.category as string;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    if (!playerName || !category) {
      throw new Error('playerName and category are required');
    }

    return await getEloHistory(playerName, category, startDate, endDate);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 2 minutes - analytics data is expensive to compute but changes frequently
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
  }
);







