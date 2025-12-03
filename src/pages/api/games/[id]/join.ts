import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession, parseRequiredQueryString } from '@/features/infrastructure/api';
import { joinGame } from '@/features/modules/game-management/games/lib/gameService';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/games/[id]/join');

/**
 * POST /api/games/[id]/join - Join a scheduled game (requires authentication)
 */
export default createPostHandler<{ success: boolean }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const gameId = parseRequiredQueryString(req, 'id');

    if (!session.discordId || !session.user?.name) {
      throw new Error('Discord ID and name are required');
    }

    await joinGame(gameId, session.discordId, session.user.name);
    
    logger.info('User joined game', { gameId, discordId: session.discordId });
    return { success: true }; // Wrapped as { success: true, data: { success: true } }
  },
  {
    requireAuth: true,
    logRequests: true,
  }
);

