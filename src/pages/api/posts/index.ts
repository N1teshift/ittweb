import type { NextApiRequest } from 'next';
import { createGetPostHandler, requireSession } from '@/features/infrastructure/api/routeHandlers';
import { parseQueryBoolean } from '@/features/infrastructure/api/queryParser';
import { validateRequiredFields, validateString } from '@/features/infrastructure/api/validators';
import { getAllPosts, createPost } from '@/features/modules/blog/lib/postService';
import { CreatePost } from '@/types/post';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { Post } from '@/types/post';

const logger = createComponentLogger('api/posts');

/**
 * GET /api/posts - Get all posts (public)
 * POST /api/posts - Create a new post (requires authentication)
 */
export default createGetPostHandler<Post[] | { id: string }>(
  async (req: NextApiRequest, res, context) => {
    if (req.method === 'GET') {
      // Get all posts (public)
      const includeUnpublished = parseQueryBoolean(req, 'includeUnpublished', false) || false;
      const posts = await getAllPosts(includeUnpublished);
      return posts;
    }

    if (req.method === 'POST') {
      // Create a new post (requires authentication)
      if (!context?.session) {
        throw new Error('Authentication required');
      }
      const session = context.session;
      const postData: CreatePost = req.body;

      // Add user info from session
      const postWithUser: CreatePost = {
        ...postData,
        creatorName: postData.creatorName || session.user?.name || 'Unknown',
        createdByDiscordId: session.discordId || null,
        published: postData.published ?? true,
      };

      const postId = await createPost(postWithUser);
      logger.info('Post created', { postId, slug: postData.slug });
      
      return { id: postId };
    }

    throw new Error('Method not allowed');
  },
  {
    requireAuth: false, // GET is public, POST uses requireSession helper
    logRequests: true,
    // Cache for 10 minutes - posts don't change frequently
    cacheControl: {
      public: true,
      maxAge: 600,
      mustRevalidate: true,
    },
    validateBody: (body: unknown) => {
      // Only validate POST requests (GET requests don't have body)
      if (body && typeof body === 'object' && body !== null) {
        const requiredError = validateRequiredFields(body, ['title', 'content', 'slug', 'date']);
        if (requiredError) return requiredError;
        const bodyObj = body as { title?: unknown; slug?: unknown };
        const titleResult = validateString(bodyObj.title, 'title', 1);
        if (typeof titleResult === 'string' && titleResult.startsWith('title must be')) {
          return titleResult;
        }
        const slugResult = validateString(bodyObj.slug, 'slug', 1);
        if (typeof slugResult === 'string' && slugResult.startsWith('slug must be')) {
          return slugResult;
        }
      }
      return true;
    },
  }
);

