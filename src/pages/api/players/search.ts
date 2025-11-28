import type { NextApiRequest } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { searchPlayers } from '@/features/modules/players/lib/playerService';
import { parseQueryString } from '@/features/infrastructure/api/queryParser';

/**
 * GET /api/players/search?q=... - Search players
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const query = parseQueryString(req, 'q');
    if (!query || query.trim().length < 2) {
      return [];
    }

    return await searchPlayers(query);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
    cacheControl: {
      maxAge: 300, // Cache for 5 minutes
      public: true,
    },
  }
);






