import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { parseRequiredQueryString } from '@/features/infrastructure/api/queryParser';
import { leaveGame } from '@/features/modules/games/lib/gameService';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/games/[id]/leave');

/**
 * POST /api/games/[id]/leave - Leave a scheduled game (requires authentication)
 */
export default createPostHandler<{ success: boolean }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const gameId = parseRequiredQueryString(req, 'id');

    if (!session.discordId) {
      throw new Error('Discord ID is required');
    }

    await leaveGame(gameId, session.discordId);
    
    logger.info('User left game', { gameId, discordId: session.discordId });
    return { success: true }; // Wrapped as { success: true, data: { success: true } }
  },
  {
    requireAuth: true,
    logRequests: true,
  }
);

