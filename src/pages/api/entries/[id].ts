import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getEntryById, updateEntry, deleteEntry } from '@/features/modules/entries/lib/entryService';
import { UpdateEntry } from '@/types/entry';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/entries/[id]');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Entry ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get entry by ID (public)
      const entry = await getEntryById(id);
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      return res.status(200).json(entry);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update entry (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const updates: UpdateEntry = req.body;
      await updateEntry(id, updates);
      logger.info('Entry updated', { id });
      
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Delete entry (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await deleteEntry(id);
      logger.info('Entry deleted', { id });
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/entries/[id]',
      operation: req.method || 'unknown',
      id,
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

