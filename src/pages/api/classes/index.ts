import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getClassStats } from '@/features/modules/analytics-group/analytics/lib/analyticsService';

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
    // Cache for 5 minutes - class stats don't change very frequently
    cacheControl: {
      public: true,
      maxAge: 300,
      mustRevalidate: true,
    },
  }
);






