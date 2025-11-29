import type { NextApiRequest } from 'next';
import { createGetPostHandler } from '@/features/infrastructure/api/routeHandlers';
import { parseQueryString, parseQueryInt, parseQueryEnum, parseQueryDate } from '@/features/infrastructure/api/queryParser';
import { createScheduledGame, createCompletedGame, getGames } from '@/features/modules/games/lib/gameService';
import type { CreateScheduledGame, CreateCompletedGame, GameFilters } from '@/features/modules/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getUserDataByDiscordIdServer } from '@/features/infrastructure/lib/userDataService.server';
import { isAdmin } from '@/features/infrastructure/utils/userRoleUtils';
import type { Game, GameListResponse } from '@/features/modules/games/types';

const logger = createComponentLogger('api/games');

/**
 * GET /api/games - Get all games with filters (public)
 * POST /api/games - Create a new game (requires authentication)
 */
export default createGetPostHandler<GameListResponse | { id: string }>(
  async (req: NextApiRequest, res, context) => {
    if (req.method === 'GET') {
      // Get all games with filters
      const filters: GameFilters = {
        gameState: parseQueryEnum(req, 'gameState', ['scheduled', 'completed'] as const),
        startDate: parseQueryString(req, 'startDate'),
        endDate: parseQueryString(req, 'endDate'),
        category: parseQueryString(req, 'category'),
        player: parseQueryString(req, 'player'),
        ally: parseQueryString(req, 'ally'),
        enemy: parseQueryString(req, 'enemy'),
        teamFormat: parseQueryString(req, 'teamFormat'),
        gameId: parseQueryInt(req, 'gameId'),
        page: parseQueryInt(req, 'page'),
        limit: parseQueryInt(req, 'limit'),
        cursor: parseQueryString(req, 'cursor'),
      };

      const result = await getGames(filters);
      return result;
    }

    if (req.method === 'POST') {
      // Create a new game (requires authentication)
      if (!context?.session) {
        throw new Error('Authentication required');
      }
      const session = context.session;

      const body = req.body as { gameState?: 'scheduled' | 'completed' } & (CreateScheduledGame | CreateCompletedGame);
      const gameState = body.gameState || 'completed';

      if (gameState === 'scheduled') {
        const gameData = body as CreateScheduledGame;

        // Validate required fields
        if (!gameData.scheduledDateTime || !gameData.timezone || !gameData.teamSize || !gameData.gameType) {
          throw new Error('Missing required fields: scheduledDateTime, timezone, teamSize, and gameType are required');
        }

        // Validate scheduledDateTime is in the future (unless admin)
        const scheduledDate = new Date(gameData.scheduledDateTime);
        const isPastDate = scheduledDate < new Date();
        
        if (isPastDate) {
          const userData = await getUserDataByDiscordIdServer(session.discordId || '');
          const userIsAdmin = isAdmin(userData?.role);
          
          if (!userIsAdmin) {
            throw new Error('Scheduled date must be in the future');
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
        
        return { id: gameId };
      } else {
        // Completed game
        const gameData = body as CreateCompletedGame;

        // Validate required fields
        if (!gameData.gameId || !gameData.datetime || !gameData.players || gameData.players.length < 2) {
          throw new Error('Missing required fields: gameId, datetime, and at least 2 players are required');
        }

        // Validate players
        for (const player of gameData.players) {
          if (!player.name || !player.flag || player.pid === undefined) {
            throw new Error('Invalid player data: name, flag, and pid are required');
          }
          if (!['winner', 'loser', 'drawer'].includes(player.flag)) {
            throw new Error(`Invalid player flag: ${player.flag}`);
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
        
        return { id: gameId };
      }
    }

    throw new Error('Method not allowed');
  },
  {
    requireAuth: false, // GET is public, POST will check auth manually
    logRequests: true,
  }
);






