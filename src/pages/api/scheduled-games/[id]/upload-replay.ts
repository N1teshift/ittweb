import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { getScheduledGameById, updateScheduledGame } from '@/features/ittweb/scheduled-games/lib/scheduledGameService';
import { createGame } from '@/features/ittweb/games/lib/gameService';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getAdminTimestamp, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';
import type { CreateGame } from '@/features/ittweb/games/types';
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
    const archiveEntryData = {
      title: `Game #${scheduledGame.scheduledGameId} - ${scheduledGame.teamSize === 'custom' ? scheduledGame.customTeamSize : scheduledGame.teamSize}`,
      content: `Scheduled game completed. ${scheduledGame.gameType === 'elo' ? 'ELO' : 'Normal'} game.`,
      author: scheduledGame.scheduledByName,
      createdByDiscordId: scheduledGame.scheduledByDiscordId,
      createdByName: scheduledGame.scheduledByName,
      replayUrl: '', // Will be updated after upload
      mediaType: 'replay',
      sectionOrder: ['replay', 'text'],
      dateInfo: {
        type: 'single',
        singleDate: scheduledGame.scheduledDateTime,
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

    // TODO: Parse replay file to extract game data
    // For now, we'll require manual game data or use scheduled game data as fallback
    const gameDataJson = Array.isArray(fields.gameData) ? fields.gameData[0] : fields.gameData;
    let gameData: CreateGame | null = null;

    if (gameDataJson) {
      // Use provided game data
      try {
        gameData = JSON.parse(gameDataJson as string) as CreateGame;
      } catch {
        return res.status(400).json({ error: 'Invalid gameData JSON. Please provide valid JSON string.' });
      }
    }

    if (gameData) {
      gameData.gameId = gameData.gameId || scheduledGame.scheduledGameId;
      gameData.datetime = gameData.datetime || scheduledGame.scheduledDateTime;
      gameData.duration = gameData.duration || scheduledGame.gameLength || 1800;
      gameData.gamename = gameData.gamename || `Scheduled Game ${scheduledGame.scheduledGameId}`;
      gameData.map = gameData.map || 'Unknown';
      gameData.creatorname = gameData.creatorname || scheduledGame.scheduledByName || 'Unknown';
      gameData.ownername = gameData.ownername || scheduledGame.scheduledByName || 'Unknown';
      gameData.category = gameData.category || scheduledGame.teamSize;

      if (!Array.isArray(gameData.players) || gameData.players.length < 2) {
        const participants = scheduledGame.participants || [];
        if (participants.length >= 2) {
          gameData.players = participants.slice(0, 12).map((participant, index) => ({
            name: participant.name,
            pid: index,
            flag: 'drawer',
          }));
        }
      }

      if (!Array.isArray(gameData.players) || gameData.players.length < 2) {
        return res.status(400).json({
          error: 'Game data must include at least 2 players. Provide detailed gameData JSON or ensure scheduled game has participants.',
        });
      }
    }

    // Add scheduled game link
    let gameId: string | undefined;
    if (gameData) {
      // Create game record only when we have data
      gameData.scheduledGameId = scheduledGame.scheduledGameId;
      gameId = await createGame(gameData);
    }

    // Update scheduled game status to archived and link game/archive
    await updateScheduledGame(scheduledGameId, {
      status: 'archived',
      ...(gameId ? { gameId } : {}),
      archiveId,
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

