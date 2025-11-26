import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAllScheduledGames, createScheduledGame } from '@/features/ittweb/scheduled-games/lib/scheduledGameService';
import { CreateScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/scheduled-games');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all scheduled games (public, but can filter past games)
      const includePast = req.query.includePast === 'true';
      const games = await getAllScheduledGames(includePast);
      return res.status(200).json(games);
    }

    if (req.method === 'POST') {
      // Create a new scheduled game (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const gameData: CreateScheduledGame = req.body;

      // Validate required fields
      if (!gameData.scheduledDateTime || !gameData.timezone || !gameData.teamSize || !gameData.gameType) {
        return res.status(400).json({ 
          error: 'Missing required fields: scheduledDateTime, timezone, teamSize, and gameType are required' 
        });
      }

      // Validate scheduledDateTime is in the future
      const scheduledDate = new Date(gameData.scheduledDateTime);
      if (scheduledDate < new Date()) {
        return res.status(400).json({ 
          error: 'Scheduled date must be in the future' 
        });
      }

      // Add user info from session
      const gameWithUser: CreateScheduledGame = {
        ...gameData,
        scheduledByDiscordId: session.discordId || '',
        scheduledByName: session.user?.name ?? 'Unknown',
      };

      // Add creator as participant if requested
      const addCreatorToParticipants = (req.body as any).addCreatorToParticipants !== false; // Default true
      if (addCreatorToParticipants && session.discordId && session.user?.name) {
        gameWithUser.participants = [{
          discordId: session.discordId,
          name: session.user.name,
          joinedAt: new Date().toISOString(),
        }];
      }

      const gameId = await createScheduledGame(gameWithUser);
      logger.info('Scheduled game created', { gameId, scheduledDateTime: gameData.scheduledDateTime });
      
      return res.status(201).json({ id: gameId, success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/scheduled-games',
      method: req.method,
      url: req.url,
    });
    
    // In development, include more error details
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;
    
    // Also log stack trace in development
    if (process.env.NODE_ENV !== 'production') {
      logger.error('Error stack:', err.stack);
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: err.stack,
        details: err.message 
      })
    });
  }
}

