import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { getGameById, updateEloScores } from '@/features/modules/games/lib/gameService';
import { parseReplayFile } from '@/features/modules/games/lib/replayParser';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getAdminTimestamp, getStorageAdmin, getStorageBucketName } from '@/features/infrastructure/api/firebase/admin';
import { timestampToIso } from '@/features/infrastructure/utils/timestampUtils';
import type { CreateCompletedGame, Game } from '@/features/modules/games/types';
import { IncomingForm, Fields, Files, File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';
import os from 'os';
import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase/firestore';

const logger = createComponentLogger('api/games/[id]/upload-replay');

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

    const gameId = req.query.id as string;
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    // Get the game
    const game = await getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if game is scheduled
    if (game.gameState !== 'scheduled') {
      return res.status(400).json({ error: 'Can only upload replay for scheduled games' });
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
    await fs.unlink(replayFile.filepath).catch(() => {});

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
          return res.status(400).json({ 
            error: 'Replay parsing failed and invalid gameData JSON provided. Please provide valid JSON string.' 
          });
        }
      } else {
        return res.status(422).json({
          error: 'Replay parsing failed. Please supply gameData JSON or try again later.',
        });
      }
    }

    if (!parsedGameData || !parsedGameData.players || parsedGameData.players.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid game data: at least 2 players are required' 
      });
    }

    // Update the game document to convert from scheduled to completed
    // Keep participants array, add completed game fields, add players subcollection
    const gameRef = adminDb.collection('games').doc(gameId);
    
    // Extract player names for quick access
    const playerNames = parsedGameData.players.map(p => p.name);
    const playerCount = parsedGameData.players.length;

    // Update game document
    await gameRef.update({
      gameState: 'completed',
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
    });

    // Add players to subcollection (clear existing players first if any)
    const playersCollection = gameRef.collection('players');
    const existingPlayersSnapshot = await playersCollection.get();
    const deletePromises = existingPlayersSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
    
    const adminTimestampNow = adminTimestamp.now();
    
    for (const player of parsedGameData.players) {
      await playersCollection.add({
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
        createdAt: adminTimestampNow,
      });
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

    return res.status(200).json({ 
      success: true,
      gameId,
      message: 'Replay uploaded and game completed successfully'
    });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/games/[id]/upload-replay',
      operation: 'upload-replay',
      method: req.method,
      gameId: req.query.id,
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

