import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAllEntries, createEntry } from '@/features/modules/entries/lib/entryService';
import { CreateEntry } from '@/types/entry';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/entries');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all entries (public)
      const contentType = req.query.contentType as 'post' | 'memory' | undefined;
      const entries = await getAllEntries(contentType);
      return res.status(200).json(entries);
    }

    if (req.method === 'POST') {
      // Create a new entry (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const entryData: CreateEntry = req.body;

      // Validate required fields
      if (!entryData.title || !entryData.content || !entryData.contentType || !entryData.date) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, content, contentType, and date are required' 
        });
      }

      // Add user info from session
      const entryWithUser: CreateEntry = {
        ...entryData,
        creatorName: entryData.creatorName || session.user?.name || 'Unknown',
        createdByDiscordId: entryData.createdByDiscordId || session.discordId || null,
      };

      const entryId = await createEntry(entryWithUser);
      logger.info('Entry created', { entryId, contentType: entryData.contentType });
      
      return res.status(201).json({ id: entryId, success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/entries',
      operation: req.method || 'unknown',
      method: req.method,
    });

    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;

    return res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { 
        details: err.message 
      })
    });
  }
}

