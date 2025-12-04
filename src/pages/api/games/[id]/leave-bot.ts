import type { NextApiRequest, NextApiResponse } from 'next';
import { leaveGame } from '@/features/modules/game-management/games/lib/gameService.participation.server';
import { getUserDataByDiscordIdServer } from '@/features/modules/community/users/services/userDataService.server';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('api/games/[id]/leave-bot');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate bot API key
    const botKey = req.headers['x-bot-api-key'];
    if (!botKey || botKey !== process.env.BOT_API_KEY) {
      logger.warn('Invalid or missing bot API key');
      return res.status(401).json({ error: 'Invalid bot API key' });
    }

    const gameId = req.query.id as string;
    const { discordId } = req.body;

    // Validate required fields
    if (!gameId || !discordId) {
      return res.status(400).json({ error: 'Missing required fields: gameId, discordId' });
    }

    // Validate Discord user exists in our system
    const user = await getUserDataByDiscordIdServer(discordId);
    if (!user) {
      logger.warn('Discord user not found in system', { discordId });
      return res.status(404).json({ error: 'User not found in system' });
    }

    // Leave the game
    await leaveGame(gameId, discordId);

    logger.info('Bot successfully left game', { gameId, discordId });
    res.status(200).json({ success: true });

  } catch (error) {
    const err = error as Error;
    logger.error('Bot leave game failed', err, { gameId: req.query.id, discordId: req.body?.discordId });

    // Handle specific error types
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (err.message.includes('Can only leave scheduled games')) {
      return res.status(400).json({ error: 'Can only leave scheduled games' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
