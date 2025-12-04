import type { NextApiRequest } from 'next';
import { createGetPostHandler, parseQueryEnum, zodValidator } from '@/features/infrastructure/api';
import { CreateEntrySchema } from '@/features/modules/game-management/entries/lib';
import { getAllEntries } from '@/features/modules/game-management/entries/lib/entryService.server';
import { createEntry } from '@/features/modules/game-management/entries/lib/entryService';
import { CreateEntry } from '@/types/entry';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { Entry } from '@/types/entry';

const logger = createComponentLogger('api/entries');

/**
 * GET /api/entries - Get all entries (public)
 * POST /api/entries - Create a new entry (requires authentication)
 */
export default createGetPostHandler<Entry[] | { id: string }>(
  async (req: NextApiRequest, res, context) => {
    if (req.method === 'GET') {
      // Get all entries (public)
      const contentType = parseQueryEnum(req, 'contentType', ['post', 'memory'] as const);
      const entries = await getAllEntries(contentType);
      return entries;
    }

    if (req.method === 'POST') {
      // Create a new entry (requires authentication)
      if (!context?.session) {
        throw new Error('Authentication required');
      }
      const session = context.session;

      const entryData: CreateEntry = req.body;

      // Add user info from session
      const entryWithUser: CreateEntry = {
        ...entryData,
        creatorName: entryData.creatorName || session.user?.name || 'Unknown',
        createdByDiscordId: entryData.createdByDiscordId || session.discordId || null,
      };

      const entryId = await createEntry(entryWithUser);
      logger.info('Entry created', { entryId, contentType: entryData.contentType });
      
      return { id: entryId };
    }

    throw new Error('Method not allowed');
  },
  {
    requireAuth: false, // GET is public, POST uses context.session check
    logRequests: true,
    // Cache for 2 minutes - entries may be added/updated
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
    validateBody: zodValidator(CreateEntrySchema),
  }
);


