import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { updateDataCollectionNoticeAcceptance } from '@/features/shared/lib/userDataService';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/user/accept-data-notice');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.discordId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const discordId = session.discordId;

    logger.info('Accepting data collection notice', { discordId });

    await updateDataCollectionNoticeAcceptance(discordId, true);

    return res.status(200).json({ success: true });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to accept data collection notice', {
      component: 'api/user/accept-data-notice',
      operation: 'acceptDataNotice',
    });

    return res.status(500).json({ 
      error: 'Failed to update acceptance status',
      message: err.message 
    });
  }
}


