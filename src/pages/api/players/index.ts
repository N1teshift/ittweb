import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getAllPlayers } from '@/features/ittweb/players/lib/playerService';

/**
 * GET /api/players - Get all players
 */
export default createApiHandler(
  async (req: NextApiRequest) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    return await getAllPlayers(limit);
  },
  {
    methods: ['GET'],
    requireAuth: false,
    logRequests: true,
  }
);

