import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { createGame, getGames } from '@/features/ittweb/games/lib/gameService';
import type { CreateGame, GameFilters } from '@/features/ittweb/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/games');

/**
 * GET /api/games - List games with filters
 */
const handleGet = async (req: NextApiRequest): Promise<ReturnType<typeof getGames>> => {
  const filters: GameFilters = {
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    category: req.query.category as string | undefined,
    player: req.query.player as string | undefined,
    ally: req.query.ally as string | undefined,
    enemy: req.query.enemy as string | undefined,
    teamFormat: req.query.teamFormat as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    cursor: req.query.cursor as string | undefined,
  };

  return await getGames(filters);
};

/**
 * POST /api/games - Create a new game
 */
const handlePost = async (req: NextApiRequest): Promise<{ id: string }> => {
  const gameData = req.body as CreateGame;

  // Validate required fields
  if (!gameData.gameId || !gameData.datetime || !gameData.players || gameData.players.length < 2) {
    throw new Error('Invalid game data: gameId, datetime, and at least 2 players are required');
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

  const id = await createGame(gameData);
  logger.info('Game created via API', { id, gameId: gameData.gameId });
  
  return { id };
};

export default createApiHandler(
  async (req: NextApiRequest) => {
    if (req.method === 'GET') {
      return await handleGet(req);
    }
    if (req.method === 'POST') {
      return await handlePost(req);
    }
    throw new Error('Method not allowed');
  },
  {
    methods: ['GET', 'POST'],
    requireAuth: false, // TODO: Require auth for POST
    logRequests: true,
  }
);

