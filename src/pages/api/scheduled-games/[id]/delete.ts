import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { deleteScheduledGame, getScheduledGameById } from '@/features/modules/scheduled-games/lib/scheduledGameService';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/scheduled-games/delete');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Require authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.discordId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const gameId = req.query.id as string;
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    // Get the game to check ownership
    const game = await getScheduledGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is the creator
    const isCreator = game.scheduledByDiscordId === session.discordId;

    // Check if user is admin
    let userIsAdmin = false;
    try {
      const userData = await getUserDataByDiscordId(session.discordId);
      userIsAdmin = isAdmin(userData?.role);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to check user role', err, {
        discordId: session.discordId,
      });
      // Continue with permission check - if role check fails, only allow creator
    }

    // Only allow deletion if user is creator or admin
    if (!isCreator && !userIsAdmin) {
      return res.status(403).json({ 
        error: 'Only the game creator or an admin can delete this game' 
      });
    }

    await deleteScheduledGame(gameId);
    
    logger.info('Game deleted', { gameId, discordId: session.discordId, isCreator, userIsAdmin });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/scheduled-games/delete',
      operation: 'delete',
      method: req.method,
      gameId: req.query.id,
    });
    
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;
    
    return res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { 
        details: err.message 
      })
    });
  }
}


