import type { NextApiRequest } from 'next';
import { createGetPostHandler, parseQueryBoolean, zodValidator } from '@/features/infrastructure/api';
import { CreatePostSchema } from '@/features/modules/content/blog/lib';
import { getAllPosts } from '@/features/modules/content/blog/lib/postService.server';
import { createPost } from '@/features/modules/content/blog/lib/postService';
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
    validateBody: zodValidator(CreatePostSchema),
  }
);


