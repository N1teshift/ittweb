import type { NextApiRequest, NextApiResponse } from 'next';
import { createApiHandler } from '@/features/infrastructure/api/routeHandlers';
import { getGameById, updateGame, deleteGame } from '@/features/ittweb/games/lib/gameService';
import type { UpdateGame } from '@/features/ittweb/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/games/[id]');

/**
 * GET /api/games/[id] - Get a single game
 */
const handleGet = async (req: NextApiRequest): Promise<ReturnType<typeof getGameById>> => {
  const id = req.query.id as string;
  if (!id) {
    throw new Error('Game ID is required');
  }

  const game = await getGameById(id);
  if (!game) {
    throw new Error('Game not found');
  }

  return game;
};

/**
 * PUT /api/games/[id] - Update a game
 */
const handlePut = async (req: NextApiRequest): Promise<void> => {
  const id = req.query.id as string;
  if (!id) {
    throw new Error('Game ID is required');
  }

  const updates = req.body as UpdateGame;
  await updateGame(id, updates);
  logger.info('Game updated via API', { id });
};

/**
 * DELETE /api/games/[id] - Delete a game
 */
const handleDelete = async (req: NextApiRequest): Promise<void> => {
  const id = req.query.id as string;
  if (!id) {
    throw new Error('Game ID is required');
  }

  await deleteGame(id);
  logger.info('Game deleted via API', { id });
};

export default createApiHandler(
  async (req: NextApiRequest) => {
    if (req.method === 'GET') {
      return await handleGet(req);
    }
    if (req.method === 'PUT') {
      return await handlePut(req);
    }
    if (req.method === 'DELETE') {
      return await handleDelete(req);
    }
    throw new Error('Method not allowed');
  },
  {
    methods: ['GET', 'PUT', 'DELETE'],
    requireAuth: false, // TODO: Require auth for PUT/DELETE
    logRequests: true,
  }
);

