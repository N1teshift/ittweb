import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { comparePlayers } from '@/features/modules/community/players/lib/playerService';
import type { PlayerSearchFilters } from '@/features/modules/community/players/types';

/**
 * GET /api/players/compare?names=... - Compare players
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const namesParam = req.query.names as string;
    if (!namesParam) {
      throw new Error('Player names are required (comma-separated)');
    }

    const names = namesParam.split(',').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length < 2) {
      throw new Error('At least 2 player names are required');
    }

    const filters: PlayerSearchFilters = {
      category: req.query.category as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    return await comparePlayers(names, filters);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 1 minute - comparison data is expensive to compute
    cacheControl: {
      public: true,
      maxAge: 60,
      mustRevalidate: true,
    },
  }
);







