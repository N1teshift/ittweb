import type { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createApiHandler, zodValidator } from '@/features/infrastructure/api';
import { UpdateEntrySchema } from '@/features/modules/game-management/entries/lib';
import { getEntryById, updateEntry, deleteEntry } from '@/features/modules/game-management/entries/lib/entryService';
import { UpdateEntry } from '@/types/entry';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { Entry } from '@/types/entry';

const logger = createComponentLogger('api/entries/[id]');

/**
 * GET /api/entries/[id] - Get entry by ID (public)
 * PUT /api/entries/[id] - Update entry (requires authentication)
 * PATCH /api/entries/[id] - Update entry (requires authentication)
 * DELETE /api/entries/[id] - Delete entry (requires authentication)
 */
export default createApiHandler<Entry | { success: boolean }>(
  async (req: NextApiRequest, res) => {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new Error('Entry ID is required');
    }

    if (req.method === 'GET') {
      // Get entry by ID (public)
      const entry = await getEntryById(id);
      if (!entry) {
        throw new Error('Entry not found');
      }
      return entry;
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update entry (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        throw new Error('Authentication required');
      }

      // Body is already validated by validateBody option
      const updates: UpdateEntry = req.body;
      await updateEntry(id, updates);
      logger.info('Entry updated', { id });
      
      return { success: true };
    }

    if (req.method === 'DELETE') {
      // Delete entry (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        throw new Error('Authentication required');
      }

      await deleteEntry(id);
      logger.info('Entry deleted', { id });
      
      return { success: true };
    }

    throw new Error('Method not allowed');
  },
  {
    methods: ['GET', 'PUT', 'PATCH', 'DELETE'],
    requireAuth: false, // GET is public, others check auth manually
    logRequests: true,
    // Cache for 2 minutes - entries may be updated
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
    // Only validate body for PUT/PATCH requests (GET/DELETE don't have bodies)
    validateBody: zodValidator(UpdateEntrySchema),
  }
);

