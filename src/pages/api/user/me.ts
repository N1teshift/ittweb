import type { NextApiRequest } from 'next';
import { createGetHandler, requireSession } from '@/features/infrastructure/api';
import { getUserDataByDiscordIdServer } from '@/features/modules/community/users/services/userDataService.server';
import type { UserData } from '@/types/userData';

/**
 * GET /api/user/me - Get current user's data (requires authentication)
 */
export default createGetHandler<UserData | null>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const userData = await getUserDataByDiscordIdServer(session.discordId || '');

    return userData;
  },
  {
    requireAuth: true,
    logRequests: true,
    // Private cache - user-specific data should not be cached publicly
    cacheControl: {
      private: true,
      maxAge: 60,
      mustRevalidate: true,
    },
  }
);


