import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { validateRequiredFields, validateString } from '@/features/infrastructure/api/validators';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/revalidate');

/**
 * POST /api/revalidate - Revalidate a Next.js static path (requires authentication)
 */
export default createPostHandler<{ revalidated: boolean; path: string }>(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    
    // Get the path to revalidate from the request body
    const { path } = req.body;

    if (!path || typeof path !== 'string') {
      throw new Error('Path is required');
    }

    // Revalidate the path
    await res.revalidate(path);
    logger.info('Path revalidated', { path, userId: session.discordId });
    
    return { revalidated: true, path };
  },
  {
    requireAuth: true,
    validateBody: (body: unknown) => {
      const requiredError = validateRequiredFields(body, ['path']);
      if (requiredError) return requiredError;
      if (typeof body === 'object' && body !== null && 'path' in body) {
        return validateString((body as { path: unknown }).path, 'path', 1) || true;
      }
      return 'Invalid request body';
    },
    logRequests: true,
  }
);

