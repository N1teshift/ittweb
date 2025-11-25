import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { 
  getPostById, 
  updatePost, 
  deletePost 
} from '@/features/ittweb/blog/lib/postService';
import { CreatePost } from '@/types/post';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/posts/[id]');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Post ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get a single post (public)
      const post = await getPostById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(200).json(post);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      // Update a post (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const updates: Partial<CreatePost> = req.body;
      await updatePost(id, updates);
      logger.info('Post updated', { id });
      
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Delete a post (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await deletePost(id);
      logger.info('Post deleted', { id });
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/posts/[id]',
      method: req.method,
      id,
    });
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message 
    });
  }
}

