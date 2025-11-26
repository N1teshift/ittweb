import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { joinScheduledGame } from '@/features/modules/scheduled-games/lib/scheduledGameService';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/scheduled-games/join');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
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

    const name = session.user?.name || 'Unknown';
    await joinScheduledGame(gameId, session.discordId, name);
    
    logger.info('User joined game', { gameId, discordId: session.discordId });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/scheduled-games/join',
      operation: 'join',
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


