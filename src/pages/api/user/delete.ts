import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { deleteUserData } from '@/features/shared/lib/userDataService';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/user/delete');

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

    logger.info('Deleting user account', { discordId });

    await deleteUserData(discordId);

    logger.info('User account deleted successfully', { discordId });

    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to delete user account', {
      component: 'api/user/delete',
      operation: 'deleteAccount',
    });

    return res.status(500).json({ 
      error: 'Failed to delete account',
      message: err.message 
    });
  }
}

