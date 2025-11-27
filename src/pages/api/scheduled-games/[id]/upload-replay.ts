import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { getScheduledGameById, updateScheduledGame } from '@/features/modules/scheduled-games/lib/scheduledGameService';
import { createGame } from '@/features/modules/games/lib/gameService';
import { parseReplayFile } from '@/features/modules/games/lib/replayParser';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getAdminTimestamp, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { CreateGame } from '@/features/modules/games/types';
import type { ScheduledGame } from '@/types/scheduledGame';
import { IncomingForm, Fields, Files, File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';
import os from 'os';
import { randomUUID } from 'crypto';

const logger = createComponentLogger('api/scheduled-games/[id]/upload-replay');

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Require authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.discordId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const scheduledGameId = req.query.id as string;
    if (!scheduledGameId) {
      return res.status(400).json({ error: 'Scheduled game ID is required' });
    }

    // Get the scheduled game
    const scheduledGame = await getScheduledGameById(scheduledGameId);
    if (!scheduledGame) {
      return res.status(404).json({ error: 'Scheduled game not found' });
    }

    // Check if game is already archived
    if (scheduledGame.status === 'archived') {
      return res.status(400).json({ error: 'This game has already been archived' });
    }

    // Parse form data (replay file + optional game data)
    const form = new IncomingForm({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      multiples: false,
    });

    const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err, fieldsResult, filesResult) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ fields: fieldsResult, files: filesResult });
      });
    });
    
    const replayFileField = Array.isArray(files.replay) ? files.replay[0] : files.replay;
    if (!replayFileField) {
      return res.status(400).json({ error: 'Replay file is required (field name: replay)' });
    }

    const replayFile = replayFileField as FormidableFile;
    const fileBuffer = await fs.readFile(replayFile.filepath);
    const originalName = replayFile.originalFilename || 'replay.w3g';

    // Upload replay to Firebase Storage via Admin SDK
    // First, create archive entry to get the archiveId, then store replay in archives/{archiveId}/
    const adminDb = getFirestoreAdmin();
    const adminTimestamp = getAdminTimestamp();
    
    // Create archive entry first to get the ID
    // Convert scheduledDateTime to ISO string if it's a Timestamp
    const scheduledDateTimeString = timestampToIso(scheduledGame.scheduledDateTime);
    
    const archiveEntryData = {
      title: `Game #${scheduledGame.scheduledGameId} - ${scheduledGame.teamSize === 'custom' ? scheduledGame.customTeamSize : scheduledGame.teamSize}`,
      content: `Scheduled game completed. ${scheduledGame.gameType === 'elo' ? 'ELO' : 'Normal'} game.`,
      creatorName: scheduledGame.creatorName,
      createdByDiscordId: scheduledGame.createdByDiscordId,
      replayUrl: '', // Will be updated after upload
      sectionOrder: ['replay', 'text'],
      dateInfo: {
        type: 'single',
        singleDate: scheduledDateTimeString,
      },
      isDeleted: false,
      deletedAt: null,
      createdAt: adminTimestamp.now(),
      updatedAt: adminTimestamp.now(),
    };

    const archiveDocRef = await adminDb.collection('archives').add(archiveEntryData);
    const archiveId = archiveDocRef.id;

    // Now upload replay to the archive location: archives/{archiveId}/replay.w3g
    const storage = getStorageAdmin();
    const bucketName = getStorageBucketName();
    const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();
    const filePath = `archives/${archiveId}/replay.w3g`;
    const token = randomUUID();

    await bucket.file(filePath).save(fileBuffer, {
      metadata: {
        contentType: replayFile.mimetype || 'application/octet-stream',
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    // Remove temporary file
    await fs.unlink(replayFile.filepath).catch(() => {});

    const replayUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

    // Update archive entry with the replay URL
    await archiveDocRef.update({
      replayUrl,
      updatedAt: adminTimestamp.now(),
    });

    const scheduledCategory = scheduledGame.teamSize === 'custom'
      ? scheduledGame.customTeamSize || undefined
      : scheduledGame.teamSize;

    let gameData: CreateGame | null = null;
    try {
      const parsed = await parseReplayFile(fileBuffer, {
        scheduledGameId: scheduledGame.scheduledGameId,
        fallbackDatetime: scheduledDateTimeString,
        fallbackCategory: scheduledCategory,
      });
      gameData = parsed.gameData;
    } catch (parserError) {
      const parseErr = parserError as Error;
      logger.warn('Replay parsing failed, awaiting manual data', {
        scheduledGameId,
        error: parseErr.message,
      });
    }

    const gameDataJson = Array.isArray(fields.gameData) ? fields.gameData[0] : fields.gameData;

    if (gameDataJson) {
      try {
        gameData = JSON.parse(gameDataJson as string) as CreateGame;
      } catch {
        return res.status(400).json({ error: 'Invalid gameData JSON. Please provide valid JSON string.' });
      }
    }

    const preparedGameData = withScheduledGameDefaults(gameData, scheduledGame);
    if (!preparedGameData) {
      await updateScheduledGame(scheduledGameId, {
        status: 'awaiting_replay',
        linkedArchiveDocumentId: archiveId,
      });
      return res.status(422).json({
        error: 'Replay uploaded, but parsing failed. Please supply gameData JSON or try again later.',
      });
    }

    preparedGameData.replayUrl = replayUrl;
    preparedGameData.replayFileName = originalName;
    preparedGameData.scheduledGameId = scheduledGame.scheduledGameId;

    const gameId = await createGame(preparedGameData);

    // Update archive entry with linkedGameDocumentId and update sectionOrder to include game details
    await archiveDocRef.update({
      linkedGameDocumentId: gameId,
      sectionOrder: ['game', 'replay', 'text'],
      updatedAt: adminTimestamp.now(),
    });

    // Update scheduled game status to archived and link game/archive
    await updateScheduledGame(scheduledGameId, {
      status: 'archived',
      linkedGameDocumentId: gameId,
      linkedArchiveDocumentId: archiveId,
    });

    logger.info('Replay uploaded and game archived', { 
      scheduledGameId, 
      gameId, 
      archiveId,
      discordId: session.discordId 
    });

    return res.status(200).json({ 
      success: true,
      gameId,
      archiveId,
      message: 'Replay uploaded and game archived successfully'
    });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/scheduled-games/[id]/upload-replay',
      operation: 'upload-replay',
      method: req.method,
      scheduledGameId: req.query.id,
    });

    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;

    return res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { 
        details: err.message 
      })
    });
  }
}

function withScheduledGameDefaults(gameData: CreateGame | null, scheduledGame: ScheduledGame): CreateGame | null {
  if (!gameData) {
    return null;
  }

  const players = ensurePlayers(gameData.players, scheduledGame);
  if (!players) {
    return null;
  }

  const fallbackCategory = scheduledGame.teamSize === 'custom'
    ? scheduledGame.customTeamSize
    : scheduledGame.teamSize;

  // Convert scheduledDateTime to ISO string if it's a Timestamp
  const scheduledDateTimeString = timestampToIso(scheduledGame.scheduledDateTime);

  return {
    ...gameData,
    gameId: gameData.gameId || scheduledGame.scheduledGameId || Date.now(),
    datetime: gameData.datetime || scheduledDateTimeString,
    duration: gameData.duration || scheduledGame.gameLength || 1800,
    gamename: gameData.gamename || `Scheduled Game ${scheduledGame.scheduledGameId}`,
    map: gameData.map || 'Unknown',
    creatorName: gameData.creatorName || scheduledGame.creatorName || 'Unknown',
    ownername: gameData.ownername || scheduledGame.creatorName || 'Unknown',
    createdByDiscordId: gameData.createdByDiscordId || scheduledGame.createdByDiscordId,
    category: gameData.category || fallbackCategory,
    players,
  };
}

function ensurePlayers(players: CreateGame['players'] | undefined, scheduledGame: ScheduledGame): CreateGame['players'] | null {
  if (Array.isArray(players) && players.length >= 2) {
    return players.map((player, index) => ({
      ...player,
      pid: typeof player.pid === 'number' ? player.pid : index,
      flag: player.flag || 'drawer',
    }));
  }

  const participants = scheduledGame.participants || [];
  if (participants.length >= 2) {
    return participants.slice(0, 12).map((participant, index) => ({
      name: participant.name,
      pid: index,
      flag: 'drawer',
    }));
  }

  return null;
}

