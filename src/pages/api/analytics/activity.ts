import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getActivityData } from '@/features/ittweb/analytics/lib/analyticsService';

/**
 * GET /api/analytics/activity - Get activity data
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const playerName = req.query.playerName as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const category = req.query.category as string | undefined;

    return await getActivityData(playerName, startDate, endDate, category);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
  }
);


