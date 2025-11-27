import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getWinRateData } from '@/features/modules/analytics/lib/analyticsService';

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
  }
);




