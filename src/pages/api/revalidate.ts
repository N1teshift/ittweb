import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession, zodValidator, RevalidateSchema } from '@/features/infrastructure/api';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/revalidate');

/**
 * POST /api/revalidate - Revalidate a Next.js static path (requires authentication)
 */
export default createPostHandler<{ revalidated: boolean; path: string }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    
    // Get the path to revalidate from the request body
    // Body is already validated by validateBody option
    const { path } = req.body as { path: string };

    // Revalidate the path
    await res.revalidate(path);
    logger.info('Path revalidated', { path, userId: session.discordId });
    
    return { revalidated: true, path };
  },
  {
    requireAuth: true,
    validateBody: zodValidator(RevalidateSchema),
    logRequests: true,
  }
);


