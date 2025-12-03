import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createApiHandler, checkResourceOwnership, parseRequiredQueryString } from '@/features/infrastructure/api';
import { getGameById, updateGame, deleteGame } from '@/features/modules/game-management/games/lib/gameService';
import type { UpdateGame } from '@/features/modules/game-management/games/types';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/games/[id]');

/**
 * GET /api/games/[id] - Get a single game
 */
const handleGet = async (req: NextApiRequest): Promise<ReturnType<typeof getGameById>> => {
  const id = parseRequiredQueryString(req, 'id');
  const game = await getGameById(id);
  if (!game) {
    // Return 404 for not found or deleted games
    const error = new Error('Game not found');
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  return game;
};

/**
 * PUT /api/games/[id] - Update a game (requires authentication and permission)
 */
const handlePut = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get session manually since this is a mixed-method route (GET is public)
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.discordId) {
    throw new Error('Authentication required');
  }
  
  const id = parseRequiredQueryString(req, 'id');
  const game = await getGameById(id);
  if (!game) {
    throw new Error('Game not found');
  }

  // Check if user owns the resource or is admin
  const hasAccess = await checkResourceOwnership(game as unknown as { [key: string]: unknown }, session);
  if (!hasAccess) {
    throw new Error('You do not have permission to edit this game');
  }

  const updates = req.body as UpdateGame;
  await updateGame(id, updates);
  logger.info('Game updated via API', { id, userId: session.discordId });
  return {}; // Wrapped as { success: true, data: {} }
};

/**
 * DELETE /api/games/[id] - Delete a game (requires authentication and permission)
 */
const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get session manually since this is a mixed-method route (GET is public)
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.discordId) {
    throw new Error('Authentication required');
  }
  
  const id = parseRequiredQueryString(req, 'id');
  const game = await getGameById(id);
  if (!game) {
    throw new Error('Game not found');
  }

  // Check if user owns the resource or is admin
  const hasAccess = await checkResourceOwnership(game as unknown as { [key: string]: unknown }, session);
  if (!hasAccess) {
    throw new Error('You do not have permission to delete this game');
  }

  await deleteGame(id);
  logger.info('Game deleted via API', { id, userId: session.discordId });
  return {}; // Wrapped as { success: true, data: {} }
};

export default createApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      return await handleGet(req);
    }
    if (req.method === 'PUT') {
      return await handlePut(req, res);
    }
    if (req.method === 'DELETE') {
      return await handleDelete(req, res);
    }
    throw new Error('Method not allowed');
  },
  {
    methods: ['GET', 'PUT', 'DELETE'],
    requireAuth: false, // GET is public, PUT/DELETE check auth manually (mixed-method route)
    logRequests: true,
    // Cache for 2 minutes - game details may be updated
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
  }
);






