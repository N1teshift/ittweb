import type { NextApiRequest } from 'next';
import { createPostHandler } from '@/features/infrastructure/api';
import { CreateUserData } from '@/types/userData';
import { saveUserDataServer } from '@/features/modules/community/users/services/userDataService.server';
import { createComponentLogger } from '@/features/infrastructure/logging';

/**
 * POST /api/user/create - Create a new user (public endpoint for Discord bot)
 */
export default createPostHandler<{ success: boolean }>(
  async (req: NextApiRequest, _res, _context) => {
    const logger = createComponentLogger('api/user/create');

    // Body validation
    const body = req.body as Partial<CreateUserData>;

    if (!body.discordId || !body.name) {
      throw new Error('discordId and name are required');
    }

    try {
      // Create user data object
      const userData: CreateUserData = {
        discordId: body.discordId,
        name: body.name,
        preferredName: body.preferredName || body.name,
        email: body.email ?? undefined,
        avatarUrl: body.avatarUrl ?? undefined,
        username: body.username ?? undefined,
        globalName: body.globalName ?? undefined,
        displayName: body.displayName ?? undefined,
      };

      // Save user data using server-side function
      await saveUserDataServer(userData);

      logger.info('User created via API', { discordId: body.discordId });
      return { success: true };

    } catch (error) {
      logger.error('Failed to create user', error as Error, { discordId: body.discordId });
      throw error;
    }
  },
  {
    requireAuth: false, // Public endpoint for bot
    logRequests: true,
  }
);

