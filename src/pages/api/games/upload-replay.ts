import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession } from '@/features/infrastructure/api';
import { createCompletedGame, getGames, updateEloScores } from '@/features/modules/game-management/games/lib/gameService';
import { parseReplayFile } from '@/features/modules/game-management/lib/mechanics';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getAdminTimestamp, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';
import type { CreateCompletedGame } from '@/features/modules/game-management/games/types';
import { IncomingForm, Fields, Files, File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';
import os from 'os';
import { randomUUID } from 'crypto';

const logger = createComponentLogger('api/games/upload-replay');

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST /api/games/upload-replay - Upload a replay file and create a completed game (requires authentication)
 */
export default createPostHandler<{ id: string; gameId: number; message: string }>(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed due to requireAuth: true
    const session = requireSession(context);

    // Parse form data (replay file + optional scheduledGameId)
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
      throw new Error('Replay file is required (field name: replay)');
    }

    const replayFile = replayFileField as FormidableFile;
    const fileBuffer = await fs.readFile(replayFile.filepath);
    const originalName = replayFile.originalFilename || 'replay.w3g';

    // Optional: Check if a scheduled game ID was provided
    const scheduledGameIdField = Array.isArray(fields.scheduledGameId)
      ? fields.scheduledGameId[0]
      : fields.scheduledGameId;
    const scheduledGameId = scheduledGameIdField
      ? parseInt(scheduledGameIdField as string, 10)
      : undefined;

    // Parse replay file
    let parsedResult;
    try {
      parsedResult = await parseReplayFile(fileBuffer, {
        scheduledGameId,
        fallbackDatetime: new Date().toISOString(),
      });
    } catch (parserError) {
      const parseErr = parserError as Error;
      logger.error('Replay parsing failed', parseErr, {
        scheduledGameId,
      } as Record<string, unknown>);

      // Check if gameData was provided manually as fallback
      const gameDataJson = Array.isArray(fields.gameData) ? fields.gameData[0] : fields.gameData;
      if (gameDataJson) {
        try {
          const manualData = JSON.parse(gameDataJson as string);
          if (!manualData.gameId || !manualData.datetime || !manualData.players) {
            throw new Error('Invalid gameData: gameId, datetime, and players are required');
          }

          // Use manual data but still need to upload the file
          parsedResult = {
            gameData: {
              gameId: manualData.gameId,
              datetime: manualData.datetime,
              duration: manualData.duration || 1800,
              gamename: manualData.gamename || `Game ${manualData.gameId}`,
              map: manualData.map || 'Unknown',
              creatorName: manualData.creatorName || session.user?.name || 'Unknown',
              ownername: manualData.ownername || manualData.creatorName || 'Unknown',
              category: manualData.category,
              players: manualData.players,
            },
            w3mmd: { raw: [], lookup: {} },
          };
        } catch {
          throw new Error('Replay parsing failed and invalid gameData JSON provided. Please provide valid JSON string.');
        }
      } else {
        throw new Error(`Replay parsing failed. Please supply gameData JSON or try again later.${process.env.NODE_ENV !== 'production' ? ` Details: ${parseErr.message}` : ''}`);
      }
    }

    const parsedGameData = parsedResult.gameData;
    const gameId = parsedGameData.gameId;

    // Check if a game with this gameId already exists
    const existingGames = await getGames({ gameId, limit: 1 });
    if (existingGames.games.length > 0) {
      const existingGame = existingGames.games[0];

      // If it's a scheduled game, tell user to use the update endpoint instead
      if (existingGame.gameState === 'scheduled') {
        throw new Error(`A scheduled game with gameId ${gameId} already exists. Please use /api/games/${existingGame.id}/upload-replay to upload the replay.`);
      }

      // If it's already a completed game, reject
      throw new Error(`A completed game with gameId ${gameId} already exists.`);
    }

    // Create completed game from parsed data (without replayUrl first)
    const gameData: CreateCompletedGame = {
      gameId,
      datetime: parsedGameData.datetime,
      duration: parsedGameData.duration,
      gamename: parsedGameData.gamename,
      map: parsedGameData.map,
      creatorName: parsedGameData.creatorName,
      ownername: parsedGameData.ownername,
      category: parsedGameData.category,
      createdByDiscordId: session.discordId || null,
      players: parsedGameData.players,
      verified: false,
    };

    // Create the game first to get the Firestore document ID
    const createdGameId = await createCompletedGame(gameData);

    // Now upload replay to Firebase Storage using the actual game document ID
    const adminDb = getFirestoreAdmin();
    const adminTimestamp = getAdminTimestamp();
    const storage = getStorageAdmin();
    const bucketName = getStorageBucketName();
    const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();

    const filePath = `games/${createdGameId}/replay.w3g`;
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
    await fs.unlink(replayFile.filepath).catch(() => { });

    const replayUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

    // Update the game document with the replayUrl and filename
    const gameRef = adminDb.collection('games').doc(createdGameId);
    await gameRef.update({
      replayUrl,
      replayFileName: originalName,
      updatedAt: adminTimestamp.now(),
    });

    // Note: If a scheduled game exists with the same gameId in the unified games collection,
    // it would have been detected earlier and the user would have been directed to use
    // the update endpoint. No additional linking needed since they're in the same collection.

    // Update ELO scores
    try {
      await updateEloScores(createdGameId);
      logger.info('ELO scores updated', { gameId: createdGameId });
    } catch (eloError) {
      // Log but don't fail the request if ELO update fails
      logger.warn('Failed to update ELO scores', {
        gameId: createdGameId,
        error: eloError instanceof Error ? eloError.message : String(eloError),
      });
    }

    logger.info('Replay uploaded and game created', {
      gameId: createdGameId,
      gameIdNum: gameId,
      discordId: session.discordId
    });

    return {
      id: createdGameId,
      gameId: gameId,
      message: 'Replay uploaded and game created successfully'
    };
  },
  {
    requireAuth: true,
    logRequests: true,
  }
);


