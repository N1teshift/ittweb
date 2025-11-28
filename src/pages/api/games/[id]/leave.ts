import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { leaveGame } from '@/features/modules/games/lib/gameService';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/games/[id]/leave');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const gameId = req.query.id as string;
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    if (!session.discordId) {
      return res.status(400).json({ error: 'Discord ID is required' });
    }

    await leaveGame(gameId, session.discordId);
    
    logger.info('User left game', { gameId, discordId: session.discordId });
    return res.status(200).json({ success: true });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to leave game', {
      component: 'api/games/[id]/leave',
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

