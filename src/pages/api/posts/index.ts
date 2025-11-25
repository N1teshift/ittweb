import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAllPosts, createPost } from '@/features/ittweb/blog/lib/postService';
import { CreatePost } from '@/types/post';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/posts');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all posts (public)
      const includeUnpublished = req.query.includeUnpublished === 'true';
      const posts = await getAllPosts(includeUnpublished);
      return res.status(200).json(posts);
    }

    if (req.method === 'POST') {
      // Create a new post (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const postData: CreatePost = req.body;

      // Validate required fields
      if (!postData.title || !postData.content || !postData.slug || !postData.date) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, content, slug, and date are required' 
        });
      }

      // Add user info from session
      const postWithUser: CreatePost = {
        ...postData,
        createdByDiscordId: session.discordId || null,
        createdByName: session.user?.name ?? undefined,
        published: postData.published ?? true,
      };

      const postId = await createPost(postWithUser);
      logger.info('Post created', { postId, slug: postData.slug });
      
      return res.status(201).json({ id: postId, success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/posts',
      operation: req.method || 'unknown',
    });
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message 
    });
  }
}

