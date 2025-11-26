import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { updateScheduledGame, getScheduledGameById } from '@/features/modules/scheduled-games/lib/scheduledGameService';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import type { TeamSize, GameType } from '@/types/scheduledGame';

const logger = createComponentLogger('api/scheduled-games/[id]');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const gameId = req.query.id as string;
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    if (req.method === 'GET') {
      const game = await getScheduledGameById(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      return res.status(200).json(game);
    }

    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Require authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.discordId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the game to check ownership
    const game = await getScheduledGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is the creator
    if (game.scheduledByDiscordId !== session.discordId) {
      return res.status(403).json({ error: 'Only the game creator can edit this game' });
    }

    // Validate update data
    const updates = req.body;
    if (!updates.teamSize || !updates.gameType) {
      return res.status(400).json({ 
        error: 'Missing required fields: teamSize and gameType are required' 
      });
    }

    // Prepare update data
    const updateData: {
      teamSize: TeamSize;
      customTeamSize?: string;
      gameType: GameType;
      gameVersion?: string;
      gameLength?: number;
      modes: string[];
    } = {
      teamSize: updates.teamSize as TeamSize,
      gameType: updates.gameType as GameType,
      modes: updates.modes || [],
    };

    if (updates.teamSize === 'custom' && updates.customTeamSize) {
      updateData.customTeamSize = updates.customTeamSize;
    }

    if (updates.gameVersion) {
      updateData.gameVersion = updates.gameVersion;
    }

    if (updates.gameLength !== undefined) {
      updateData.gameLength = updates.gameLength;
    }

    await updateScheduledGame(gameId, updateData);
    
    logger.info('Game updated', { gameId, discordId: session.discordId });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/scheduled-games/[id]',
      operation: 'update',
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

