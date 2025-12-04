import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getStandings } from '@/features/modules/community/standings/lib/standingsService.server';
import type { StandingsFilters } from '@/features/modules/community/standings/types';

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
    // Cache for 5 minutes - standings update as games are played
    cacheControl: {
      public: true,
      maxAge: 300,
      mustRevalidate: true,
    },
  }
);







