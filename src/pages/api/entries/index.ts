import type { NextApiRequest } from 'next';
import { createGetPostHandler } from '@/features/infrastructure/api/routeHandlers';
import { parseQueryEnum } from '@/features/infrastructure/api/queryParser';
import { validateRequiredFields, validateString, validateEnum } from '@/features/infrastructure/api/validators';
import { getAllEntries, createEntry } from '@/features/modules/entries/lib/entryService';
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
    validateBody: (body) => {
      // Only validate POST requests (GET requests don't have body)
      if (body && typeof body === 'object') {
        const requiredError = validateRequiredFields(body, ['title', 'content', 'contentType', 'date']);
        if (requiredError) return requiredError;
        const bodyObj = body as { contentType?: unknown; title?: unknown };
        const allowedContentTypes = ['post', 'memory'] as const;
        const contentTypeResult = validateEnum(bodyObj.contentType, 'contentType', allowedContentTypes);
        // validateEnum returns the value when valid, or an error string when invalid, or null when not a string
        // Check if result is an error: null or a string that's not one of the allowed values
        if (contentTypeResult === null || (typeof contentTypeResult === 'string' && !allowedContentTypes.includes(contentTypeResult as typeof allowedContentTypes[number]))) {
          return contentTypeResult || 'contentType must be a string';
        }
        const titleError = validateString(bodyObj.title, 'title', 1);
        if (titleError) return titleError;
      }
      return true;
    },
  }
);

