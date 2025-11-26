import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { 
  getPostById, 
  updatePost, 
  deletePost 
} from '@/features/modules/blog/lib/postService';
import { CreatePost } from '@/types/post';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getUserDataByDiscordId } from '@/features/shared/lib/userDataService';
import { isAdmin } from '@/features/shared/utils/userRoleUtils';

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
      // Update a post (requires authentication and permission)
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.discordId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get the post to check permissions
      const post = await getPostById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user is admin or the author
      const userData = await getUserDataByDiscordId(session.discordId);
      const userIsAdmin = isAdmin(userData?.role);
      const userIsAuthor = post.createdByDiscordId === session.discordId;

      if (!userIsAdmin && !userIsAuthor) {
        return res.status(403).json({ error: 'You do not have permission to edit this post' });
      }

      const updates: Partial<CreatePost> = req.body;
      await updatePost(id, updates);
      logger.info('Post updated', { id, userId: session.discordId });
      
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Delete a post (requires authentication and permission)
      const session = await getServerSession(req, res, authOptions);
      if (!session || !session.discordId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get the post to check permissions
      const post = await getPostById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user is admin or the author
      const userData = await getUserDataByDiscordId(session.discordId);
      const userIsAdmin = isAdmin(userData?.role);
      const userIsAuthor = post.createdByDiscordId === session.discordId;

      if (!userIsAdmin && !userIsAuthor) {
        return res.status(403).json({ error: 'You do not have permission to delete this post' });
      }

      await deletePost(id);
      logger.info('Post deleted', { id, userId: session.discordId });
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/posts/[id]',
      operation: req.method || 'unknown',
      id,
    });
    return res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message 
    });
  }
}

