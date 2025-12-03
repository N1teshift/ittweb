import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getWinRateData } from '@/features/modules/analytics-group/analytics/lib/analyticsService';

/**
 * GET /api/analytics/win-rate - Get win rate data
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const playerName = req.query.playerName as string | undefined;
    const category = req.query.category as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    return await getWinRateData(playerName, category, startDate, endDate);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 5 minutes - Firestore cache handles freshness, HTTP cache reduces API calls
    cacheControl: {
      public: true,
      maxAge: 300,
      mustRevalidate: true,
    },
  }
);







