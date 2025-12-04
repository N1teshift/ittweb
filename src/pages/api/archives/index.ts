import type { NextApiRequest } from 'next';
import { createGetPostHandler } from '@/features/infrastructure/api';
import { getAllArchiveEntries } from '@/features/modules/community/archives/services/archiveService.server';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { ArchiveEntry } from '@/types/archive';

const logger = createComponentLogger('api/archives');

/**
 * GET /api/archives - Get all archive entries (public)
 * Uses server-side Admin SDK to bypass Firestore security rules
 */
export default createGetPostHandler<ArchiveEntry[]>(
  async (req: NextApiRequest) => {
    if (req.method === 'GET') {
      // Get all archive entries (public)
      const entries = await getAllArchiveEntries();
      logger.info('Archive entries fetched', { count: entries.length });
      return entries;
    }

    throw new Error('Method not allowed');
  },
  {
    requireAuth: false, // GET is public
    logRequests: true,
    // Cache for 2 minutes - archives may be added/updated
    cacheControl: {
      public: true,
      maxAge: 120,
      mustRevalidate: true,
    },
  }
);


