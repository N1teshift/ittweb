import type { NextApiRequest } from 'next';
import { createPostHandler, requireSession, parseRequiredQueryString } from '@/features/infrastructure/api';
import { getGameById, updateEloScores } from '@/features/modules/game-management/games/lib/gameService';
import { parseReplayFile } from '@/features/modules/game-management/lib/mechanics';
import { createComponentLogger } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getAdminTimestamp, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';
import { timestampToIso } from '@/features/infrastructure/utils';
import { removeUndefined } from '@/features/infrastructure/utils';
import type { CreateCompletedGame } from '@/features/modules/game-management/games/types';
import { IncomingForm, Fields, Files, File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';
import os from 'os';
import { randomUUID } from 'crypto';

const logger = createComponentLogger('api/games/[id]/upload-replay');

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST /api/games/[id]/upload-replay - Upload replay for a scheduled game and convert it to completed (requires authentication)
 */
export default createPostHandler<{ gameId: string; message: string }>(
  async (req: NextApiRequest, res, context) => {
    // Session is guaranteed due to requireAuth: true
    const session = requireSession(context);
    const gameId = parseRequiredQueryString(req, 'id');

    // Get the game
    const game = await getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Check if game is scheduled
    if (game.gameState !== 'scheduled') {
      throw new Error('Can only upload replay for scheduled games');
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
      throw new Error('Replay file is required (field name: replay)');
    }

    const replayFile = replayFileField as FormidableFile;
    const fileBuffer = await fs.readFile(replayFile.filepath);
    const originalName = replayFile.originalFilename || 'replay.w3g';

    // Upload replay to Firebase Storage
    const adminDb = getFirestoreAdmin();
    const adminTimestamp = getAdminTimestamp();
    const storage = getStorageAdmin();
    const bucketName = getStorageBucketName();
    const bucket = bucketName ? storage.bucket(bucketName) : storage.bucket();

    // Store replay in games/{gameId}/replay.w3g
    const filePath = `games/${gameId}/replay.w3g`;
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

    // Parse replay file
    const scheduledCategory = game.teamSize === 'custom'
      ? game.customTeamSize || undefined
      : game.teamSize;

    const scheduledDateTimeString = game.scheduledDateTime
      ? (typeof game.scheduledDateTime === 'string'
        ? game.scheduledDateTime
        : timestampToIso(game.scheduledDateTime))
      : new Date().toISOString();

    let parsedGameData: CreateCompletedGame | null = null;
    try {
      const parsed = await parseReplayFile(fileBuffer, {
        scheduledGameId: game.gameId,
        fallbackDatetime: scheduledDateTimeString,
        fallbackCategory: scheduledCategory,
      });

      // Convert parsed data to CreateCompletedGame format
      parsedGameData = {
        gameId: game.gameId,
        datetime: parsed.gameData.datetime,
        duration: parsed.gameData.duration,
        gamename: parsed.gameData.gamename,
        map: parsed.gameData.map,
        creatorName: game.creatorName,
        ownername: parsed.gameData.ownername,
        category: parsed.gameData.category,
        replayUrl,
        replayFileName: originalName,
        createdByDiscordId: game.createdByDiscordId || null,
        players: parsed.gameData.players,
        verified: false,
      };
    } catch (parserError) {
      const parseErr = parserError as Error;
      logger.warn('Replay parsing failed', {
        gameId,
        error: parseErr.message,
      });

      // Check if gameData was provided manually
      const gameDataJson = Array.isArray(fields.gameData) ? fields.gameData[0] : fields.gameData;
      if (gameDataJson) {
        try {
          const manualData = JSON.parse(gameDataJson as string);
          parsedGameData = {
            gameId: game.gameId,
            datetime: manualData.datetime || scheduledDateTimeString,
            duration: manualData.duration || game.gameLength || 1800,
            gamename: manualData.gamename || `Game ${game.gameId}`,
            map: manualData.map || 'Unknown',
            creatorName: game.creatorName,
            ownername: manualData.ownername || game.creatorName,
            category: manualData.category || scheduledCategory,
            replayUrl,
            replayFileName: originalName,
            createdByDiscordId: game.createdByDiscordId || null,
            players: manualData.players || [],
            verified: false,
          };
        } catch {
          throw new Error('Replay parsing failed and invalid gameData JSON provided. Please provide valid JSON string.');
        }
      } else {
        throw new Error('Replay parsing failed. Please supply gameData JSON or try again later.');
      }
    }

    if (!parsedGameData || !parsedGameData.players || parsedGameData.players.length < 2) {
      throw new Error('Invalid game data: at least 2 players are required');
    }

    // Update the game document to convert from scheduled to completed
    // Keep participants array, add completed game fields, add players subcollection
    const gameRef = adminDb.collection('games').doc(gameId);

    // Extract player names for quick access
    const playerNames = parsedGameData.players.map(p => p.name);
    const playerCount = parsedGameData.players.length;

    // Update game document
    const updateData = {
      gameState: 'completed' as const,
      datetime: adminTimestamp.fromDate(new Date(parsedGameData.datetime)),
      duration: parsedGameData.duration,
      gamename: parsedGameData.gamename,
      map: parsedGameData.map,
      ownername: parsedGameData.ownername,
      category: parsedGameData.category,
      replayUrl: parsedGameData.replayUrl,
      replayFileName: parsedGameData.replayFileName,
      playerNames,
      playerCount,
      verified: parsedGameData.verified ?? false,
      updatedAt: adminTimestamp.now(),
      // Keep scheduled fields for history
      // scheduledDateTime is already in the document
      // participants array is already in the document
    };

    logger.debug('Updating game to completed state', {
      gameId,
      updateData: {
        ...updateData,
        datetime: parsedGameData.datetime, // Log the string version for debugging
      },
    });

    try {
      await gameRef.update(updateData);
      logger.info('Game state updated to completed', { gameId });

      // Verify the update succeeded
      const updatedGameSnap = await gameRef.get();
      if (!updatedGameSnap.exists) {
        throw new Error('Game document does not exist after update');
      }
      const updatedGameData = updatedGameSnap.data();
      if (updatedGameData?.gameState !== 'completed') {
        logger.error('Game state update verification failed', undefined, {
          gameId,
          expected: 'completed',
          actual: updatedGameData?.gameState,
          updateData: {
            gameState: updateData.gameState,
          },
        });
        throw new Error(`Game state update failed: expected 'completed', got '${updatedGameData?.gameState}'`);
      }
      logger.info('Game state update verified', { gameId, gameState: updatedGameData.gameState });
    } catch (updateError) {
      const err = updateError as Error;
      logger.error('Failed to update game state to completed', err, {
        component: 'api/games/[id]/upload-replay',
        operation: 'updateGameState',
        gameId,
        updateData: {
          gameState: updateData.gameState,
          datetime: parsedGameData.datetime,
        },
      });
      throw new Error(`Failed to update game state: ${err.message}`);
    }

    // Add players to subcollection (clear existing players first if any)
    const playersCollection = gameRef.collection('players');
    const existingPlayersSnapshot = await playersCollection.get();
    const deletePromises = existingPlayersSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    const adminTimestampNow = adminTimestamp.now();

    for (const player of parsedGameData.players) {
      // Remove undefined values before writing to Firestore
      const playerData = removeUndefined({
        gameId: gameId,
        name: player.name,
        pid: player.pid,
        flag: player.flag,
        category: parsedGameData.category,
        class: player.class,
        randomClass: player.randomClass,
        kills: player.kills,
        deaths: player.deaths,
        assists: player.assists,
        gold: player.gold,
        damageDealt: player.damageDealt,
        damageTaken: player.damageTaken,
        // ITT-specific stats (schema v2+)
        selfHealing: player.selfHealing,
        allyHealing: player.allyHealing,
        meatEaten: player.meatEaten,
        goldAcquired: player.goldAcquired,
        // Animal kill counts
        killsElk: player.killsElk,
        killsHawk: player.killsHawk,
        killsSnake: player.killsSnake,
        killsWolf: player.killsWolf,
        killsBear: player.killsBear,
        killsPanther: player.killsPanther,
        createdAt: adminTimestampNow,
      } as Record<string, unknown>);

      await playersCollection.add(playerData);
    }

    // Update ELO scores for completed game
    try {
      await updateEloScores(gameId);
      logger.info('ELO scores updated', { gameId });
    } catch (eloError) {
      // Log but don't fail the request if ELO update fails
      logger.warn('Failed to update ELO scores', {
        gameId,
        error: eloError instanceof Error ? eloError.message : String(eloError),
      });
    }

    logger.info('Replay uploaded and game converted to completed', {
      gameId,
      discordId: session.discordId
    });

    return {
      gameId,
      message: 'Replay uploaded and game completed successfully'
    };
  },
  {
    requireAuth: true,
    logRequests: true,
  }
);

