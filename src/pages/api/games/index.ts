import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createScheduledGame, createCompletedGame, getGames } from '@/features/modules/games/lib/gameService';
import type { CreateScheduledGame, CreateCompletedGame, GameFilters } from '@/features/modules/games/types';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';

const logger = createComponentLogger('api/games');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all games with filters
      const filters: GameFilters = {
        gameState: req.query.gameState as 'scheduled' | 'completed' | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        category: req.query.category as string | undefined,
        player: req.query.player as string | undefined,
        ally: req.query.ally as string | undefined,
        enemy: req.query.enemy as string | undefined,
        teamFormat: req.query.teamFormat as string | undefined,
        gameId: req.query.gameId ? parseInt(req.query.gameId as string, 10) : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        cursor: req.query.cursor as string | undefined,
      };

      const result = await getGames(filters);
      return res.status(200).json({ success: true, data: result });
    }

    if (req.method === 'POST') {
      // Create a new game (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const body = req.body as { gameState?: 'scheduled' | 'completed' } & (CreateScheduledGame | CreateCompletedGame);
      const gameState = body.gameState || 'completed';

      if (gameState === 'scheduled') {
        const gameData = body as CreateScheduledGame;

        // Validate required fields
        if (!gameData.scheduledDateTime || !gameData.timezone || !gameData.teamSize || !gameData.gameType) {
          return res.status(400).json({ 
            error: 'Missing required fields: scheduledDateTime, timezone, teamSize, and gameType are required' 
          });
        }

        // Validate scheduledDateTime is in the future (unless admin)
        const scheduledDate = new Date(gameData.scheduledDateTime);
        const isPastDate = scheduledDate < new Date();
        
        if (isPastDate) {
          const userData = await getUserDataByDiscordId(session.discordId || '');
          const userIsAdmin = isAdmin(userData?.role);
          
          if (!userIsAdmin) {
            return res.status(400).json({ 
              error: 'Scheduled date must be in the future' 
            });
          }
        }

        // Add user info from session
        const gameWithUser: CreateScheduledGame = {
          ...gameData,
          creatorName: gameData.creatorName || session.user?.name || 'Unknown',
          createdByDiscordId: gameData.createdByDiscordId || session.discordId || '',
        };

        // Add creator as participant if requested
        const addCreatorToParticipants = (req.body as { addCreatorToParticipants?: boolean }).addCreatorToParticipants !== false;
        if (addCreatorToParticipants && session.discordId && session.user?.name) {
          if (!gameWithUser.participants || gameWithUser.participants.length === 0) {
            gameWithUser.participants = [{
              discordId: session.discordId,
              name: session.user.name,
              joinedAt: new Date().toISOString(),
            }];
          }
        }

        const gameId = await createScheduledGame(gameWithUser);
        logger.info('Scheduled game created', { gameId, scheduledDateTime: gameData.scheduledDateTime });
        
        return res.status(201).json({ id: gameId, success: true });
      } else {
        // Completed game
        const gameData = body as CreateCompletedGame;

        // Validate required fields
        if (!gameData.gameId || !gameData.datetime || !gameData.players || gameData.players.length < 2) {
          return res.status(400).json({ 
            error: 'Missing required fields: gameId, datetime, and at least 2 players are required' 
          });
        }

        // Validate players
        for (const player of gameData.players) {
          if (!player.name || !player.flag || player.pid === undefined) {
            return res.status(400).json({ 
              error: 'Invalid player data: name, flag, and pid are required' 
            });
          }
          if (!['winner', 'loser', 'drawer'].includes(player.flag)) {
            return res.status(400).json({ 
              error: `Invalid player flag: ${player.flag}` 
            });
          }
        }

        // Add user info from session
        const gameWithUser: CreateCompletedGame = {
          ...gameData,
          creatorName: gameData.creatorName || session.user?.name || 'Unknown',
          createdByDiscordId: gameData.createdByDiscordId || session.discordId || null,
        };

        const gameId = await createCompletedGame(gameWithUser);
        logger.info('Completed game created', { gameId, gameIdNum: gameData.gameId });
        
        return res.status(201).json({ id: gameId, success: true });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/games',
      operation: req.method || 'unknown',
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






