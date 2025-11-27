import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { searchPlayers } from '@/features/modules/players/lib/playerService';

/**
 * GET /api/players/search?q=... - Search players
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      return [];
    }

    return await searchPlayers(query);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
  }
);






