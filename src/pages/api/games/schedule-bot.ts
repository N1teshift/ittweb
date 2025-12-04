import type { NextApiRequest, NextApiResponse } from 'next';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getUserDataByDiscordIdServer } from '@/features/modules/community/users/services/userDataService.server';
import { createScheduledGame } from '@/features/modules/game-management/games/lib/gameService';
import type { CreateScheduledGame, TeamSize, GameType, GameMode, GameParticipant } from '@/features/modules/game-management/games/types';

const logger = createComponentLogger('api/games/schedule-bot');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Validate bot API key
    const botKey = req.headers['x-bot-api-key'];
    if (!botKey || botKey !== process.env.BOT_API_KEY) {
      logger.warn('Invalid or missing bot API key');
      return res.status(401).json({ success: false, error: 'Invalid bot API key' });
    }

    const {
      discordId,
      displayName,
      scheduledDateTime,
      timezone = 'UTC',
      teamSize,
      gameType,
      gameVersion,
      gameLength,
      modes = [],
      addCreatorToParticipants = true,
    } = req.body as {
      discordId: string;
      displayName: string;
      scheduledDateTime: string;
      timezone?: string;
      teamSize: string;
      gameType: string;
      gameVersion?: string;
      gameLength?: number;
      modes?: string[];
      addCreatorToParticipants?: boolean;
    };

    if (!discordId || !displayName || !scheduledDateTime || !timezone || !teamSize || !gameType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: discordId, displayName, scheduledDateTime, timezone, teamSize, gameType',
      });
    }

    // Validate user exists in our system
    const user = await getUserDataByDiscordIdServer(discordId);
    if (!user) {
      logger.warn('Discord user not found in system', { discordId });
      return res.status(404).json({
        success: false,
        error: 'User not found. Please visit the website first to create your account.',
      });
    }

    // Validate and cast team size
    const validTeamSizes: TeamSize[] = ['1v1', '2v2', '3v3', '4v4', '5v5', '6v6', 'custom'];
    if (!validTeamSizes.includes(teamSize as TeamSize)) {
      return res.status(400).json({
        success: false,
        error: `Invalid team size. Must be one of: ${validTeamSizes.join(', ')}`,
      });
    }

    // Validate and cast game type
    const validGameTypes: GameType[] = ['elo', 'normal'];
    if (!validGameTypes.includes(gameType.toLowerCase() as GameType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid game type. Must be one of: ${validGameTypes.join(', ')}`,
      });
    }

    // Build CreateScheduledGame payload
    const gameData: CreateScheduledGame = {
      scheduledDateTime,
      timezone,
      teamSize: teamSize as TeamSize,
      gameType: gameType.toLowerCase() as GameType,
      gameVersion,
      gameLength,
      modes: modes as GameMode[],
      creatorName: displayName,
      createdByDiscordId: discordId,
    };

    if (addCreatorToParticipants) {
      gameData.participants = [
        {
          discordId,
          name: displayName,
          joinedAt: new Date().toISOString(),
        },
      ] as GameParticipant[];
    }

    const gameId = await createScheduledGame(gameData);

    logger.info('Scheduled game created via bot', {
      gameId,
      scheduledDateTime,
      discordId,
    });

    return res.status(200).json({ success: true, data: { id: gameId } });
  } catch (error) {
    const err = error as Error;
    logger.error('Bot scheduled game creation failed', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
