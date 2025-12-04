import type { NextApiRequest } from 'next';
import { createGetPostHandler, parseQueryString, parseQueryInt, parseQueryEnum, createCustomValidator, formatZodErrors } from '@/features/infrastructure/api';
import { CreateScheduledGameSchema, CreateCompletedGameSchema } from '@/features/modules/game-management/games/lib';
import { createScheduledGame, createCompletedGame, getGames } from '@/features/modules/game-management/games/lib/gameService';
import type { CreateScheduledGame, CreateCompletedGame, GameFilters } from '@/features/modules/game-management/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getUserDataByDiscordIdServer } from '@/features/modules/community/users/services/userDataService.server';
import { isAdmin } from '@/features/modules/community/users';
import type { GameListResponse } from '@/features/modules/game-management/games/types';

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

      // Body is already validated by validateBody option
      const body = req.body as { gameState?: 'scheduled' | 'completed' } & (CreateScheduledGame | CreateCompletedGame);
      const gameState = body.gameState || 'completed';

      if (gameState === 'scheduled') {
        const gameData = body as CreateScheduledGame;

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
        // Body is already validated by validateBody option
        const gameData = body as CreateCompletedGame;

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
    // Cache for 2 minutes - games list changes as new games are added
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
    validateBody: createCustomValidator((body) => {
      // Determine gameState (defaults to 'completed')
      const gameState = (body as { gameState?: 'scheduled' | 'completed' })?.gameState || 'completed';

      if (gameState === 'scheduled') {
        const result = CreateScheduledGameSchema.safeParse(body);
        if (result.success) return true;
        return formatZodErrors([result.error]);
      } else {
        // Try as completed game (with or without gameState field)
        const result = CreateCompletedGameSchema.safeParse(body);
        if (result.success) return true;
        return formatZodErrors([result.error]);
      }
    }),
  }
);







