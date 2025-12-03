import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api';
import { getAllPlayers } from '@/features/modules/community/players/lib/playerService';

/**
 * GET /api/players - Get all players with pagination
 * Query params:
 *   - limit: number of players to fetch (default: 50)
 *   - lastPlayerName: cursor for pagination (player name to start after)
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const lastPlayerName = req.query.lastPlayerName as string | undefined;
    return await getAllPlayers(limit, lastPlayerName);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    // Cache for 2 minutes - player list changes as new players join
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
  }
);






