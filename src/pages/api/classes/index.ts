import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getClassStats } from '@/features/modules/analytics/lib/analyticsService';

/**
 * GET /api/classes?category=... - Get class statistics
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const category = req.query.category as string | undefined;
    return await getClassStats(category);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
  }
);





