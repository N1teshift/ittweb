import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getPlayerStats } from '@/features/modules/community/players/lib/playerService';
import type { PlayerSearchFilters } from '@/features/modules/community/players/types';

/**
 * GET /api/players/[name] - Get player statistics
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const name = req.query.name as string;
    if (!name) {
      throw new Error('Player name is required');
    }

    const filters: PlayerSearchFilters = {
      category: req.query.category as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      includeGames: req.query.includeGames === 'true',
    };

    const stats = await getPlayerStats(name, filters);
    if (!stats) {
      throw new Error('Player not found');
    }

    return stats;
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 2 minutes - player stats update as games are played
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
  }
);






