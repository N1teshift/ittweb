import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getStandings } from '@/features/modules/standings/lib/standingsService';
import type { StandingsFilters } from '@/features/modules/standings/types';

/**
 * GET /api/standings - Get leaderboard
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const filters: StandingsFilters = {
      category: req.query.category as string | undefined,
      minGames: req.query.minGames ? parseInt(req.query.minGames as string, 10) : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };

    return await getStandings(filters);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
  }
);






