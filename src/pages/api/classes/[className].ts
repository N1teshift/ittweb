import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getClassStats } from '@/features/modules/analytics/lib/analyticsService';

/**
 * GET /api/classes/[className]?category=... - Get specific class statistics
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const className = req.query.className as string;
    const category = req.query.category as string | undefined;

    if (!className) {
      throw new Error('Class name is required');
    }

    const allClassStats = await getClassStats(category);
    const classStat = allClassStats.find(cs => cs.id.toLowerCase() === className.toLowerCase());

    if (!classStat) {
      throw new Error(`Class '${className}' not found`);
    }

    return classStat;
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
  }
);





