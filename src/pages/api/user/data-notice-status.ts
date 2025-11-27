import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { logError } from '@/features/infrastructure/logging';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.discordId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const discordId = session.discordId;

    const userData = await getUserDataByDiscordId(discordId);

    return res.status(200).json({ 
      accepted: userData?.dataCollectionNoticeAccepted ?? false 
    });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to fetch data notice status', {
      component: 'api/user/data-notice-status',
      operation: 'getDataNoticeStatus',
    });

    return res.status(500).json({ 
      error: 'Failed to fetch status',
      message: err.message 
    });
  }
}






