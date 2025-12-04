import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession } from '@/features/infrastructure/api';
import { updateDataCollectionNoticeAcceptanceServer } from '@/features/modules/community/users/services/userDataService.server';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/user/accept-data-notice');

/**
 * POST /api/user/accept-data-notice - Accept data collection notice (requires authentication)
 */
export default createPostHandler<{ success: boolean }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const discordId = session.discordId || '';

    logger.info('Accepting data collection notice', { discordId });

    await updateDataCollectionNoticeAcceptanceServer(discordId, true);

    return { success: true };
  },
  {
    requireAuth: true,
    logRequests: true,
  }
);







