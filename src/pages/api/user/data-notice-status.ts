import type { NextApiRequest } from 'next';
import { createGetHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { getUserDataByDiscordId } from '@/features/infrastructure/lib/userDataService';

/**
 * GET /api/user/data-notice-status - Get user's data collection notice acceptance status (requires authentication)
 */
export default createGetHandler<{ accepted: boolean }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const userData = await getUserDataByDiscordId(session.discordId || '');

    return { 
      accepted: userData?.dataCollectionNoticeAccepted ?? false 
    };
  },
  {
    requireAuth: true,
    logRequests: true,
  }
);






