import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getAnimalKillsDistribution } from '@/features/modules/analytics-group/analytics/lib/analyticsService';

/**
 * GET /api/analytics/animal-kills - Get animal kills distribution
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

    return await getAnimalKillsDistribution(category, startDate, endDate);
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

