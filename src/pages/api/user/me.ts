import type { NextApiRequest } from 'next';
import { createGetHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { getUserDataByDiscordIdServer } from '@/features/infrastructure/lib/userDataService.server';
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
  }
);

