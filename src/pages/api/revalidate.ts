import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/revalidate');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the path to revalidate from the request body
    const { path } = req.body;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path is required' });
    }

    // Revalidate the path
    try {
      await res.revalidate(path);
      logger.info('Path revalidated', { path, userId: session.discordId });
      return res.status(200).json({ revalidated: true, path });
    } catch (err) {
      logger.error('Revalidation failed', err instanceof Error ? err : new Error(String(err)), {
        path,
        userId: session.discordId,
      });
      return res.status(500).json({ 
        error: 'Error revalidating path',
        path 
      });
    }
  } catch (error) {
    const err = error as Error;
    logError(err, 'Revalidation API request failed', {
      component: 'api/revalidate',
      method: req.method,
    });
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message 
    });
  }
}

