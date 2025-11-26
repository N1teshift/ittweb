import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getAllScheduledGames, createScheduledGame, getScheduledGameById, updateScheduledGame } from '@/features/modules/scheduled-games/lib/scheduledGameService';
import { CreateScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';
import { getFirestoreAdmin, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { createGame } from '@/features/modules/games/lib/gameService';
import type { CreateGame } from '@/features/modules/games/types';

const logger = createComponentLogger('api/scheduled-games');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all scheduled games (public, but can filter past games)
      const includePast = req.query.includePast === 'true';
      const includeArchived = req.query.includeArchived === 'true';
      const games = await getAllScheduledGames(includePast, includeArchived);
      return res.status(200).json(games);
    }

    if (req.method === 'POST') {
      // Create a new scheduled game (requires authentication)
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const gameData: CreateScheduledGame = req.body;

      // Validate required fields
      if (!gameData.scheduledDateTime || !gameData.timezone || !gameData.teamSize || !gameData.gameType) {
        return res.status(400).json({ 
          error: 'Missing required fields: scheduledDateTime, timezone, teamSize, and gameType are required' 
        });
      }

      // Validate scheduledDateTime is in the future (only for scheduled games, not manual entries)
      // Manual entries with status 'awaiting_replay' or 'archived' can be in the past
      const isManualEntry = gameData.status === 'awaiting_replay' || gameData.status === 'archived';
      if (!isManualEntry) {
        const scheduledDate = new Date(gameData.scheduledDateTime);
        if (scheduledDate < new Date()) {
          return res.status(400).json({ 
            error: 'Scheduled date must be in the future' 
          });
        }
      }

      // Add user info from session
      const gameWithUser: CreateScheduledGame = {
        ...gameData,
        scheduledByDiscordId: session.discordId || '',
        scheduledByName: session.user?.name ?? 'Unknown',
      };

      // Add creator as participant if requested (only if no participants provided)
      // For Create Game form, participants are already provided, so don't overwrite them
      const addCreatorToParticipants = (req.body as { addCreatorToParticipants?: boolean }).addCreatorToParticipants !== false; // Default true
      if (addCreatorToParticipants && session.discordId && session.user?.name) {
        // Only add creator if no participants are provided
        if (!gameWithUser.participants || gameWithUser.participants.length === 0) {
          gameWithUser.participants = [{
            discordId: session.discordId,
            name: session.user.name,
            joinedAt: new Date().toISOString(),
          }];
        }
      }

      const gameId = await createScheduledGame(gameWithUser);
      logger.info('Scheduled game created', { gameId, scheduledDateTime: gameData.scheduledDateTime });
      
      // If status is 'archived', also create a Game record and archive entry
      let archiveId: string | undefined;
      let createdGameId: string | undefined;
      if (gameData.status === 'archived') {
        try {
          const createdGame = await getScheduledGameById(gameId);
          if (createdGame && createdGame.participants && createdGame.participants.length >= 2) {
            const adminDb = getFirestoreAdmin();
            const adminTimestamp = getAdminTimestamp();
            
            // Create Game record from participants so player stats get updated
            const category = createdGame.teamSize === 'custom' 
              ? (createdGame.customTeamSize || 'custom')
              : createdGame.teamSize;
            
            const gameRecord: CreateGame = {
              gameId: createdGame.scheduledGameId,
              datetime: createdGame.scheduledDateTime,
              duration: createdGame.gameLength || 1800,
              gamename: `Test Game #${createdGame.scheduledGameId}`,
              map: 'Island Troll Tribes',
              creatorname: createdGame.scheduledByName,
              ownername: createdGame.scheduledByName,
              category,
              scheduledGameId: createdGame.scheduledGameId,
              players: createdGame.participants.map((participant, index) => ({
                name: participant.name,
                pid: index,
                flag: (participant.result === 'draw' ? 'drawer' : (participant.result || 'drawer')) as 'winner' | 'loser' | 'drawer', // winner, loser, or drawer
              })),
            };

            createdGameId = await createGame(gameRecord);
            logger.info('Game record created from archived scheduled game', { 
              gameId: createdGameId,
              scheduledGameId: createdGame.scheduledGameId 
            });
            
            // Build participant summary
            const participantSummary = createdGame.participants
              .map(p => {
                const result = p.result === 'winner' ? '🏆' : p.result === 'loser' ? '❌' : '🤝';
                return `${result} ${p.name}`;
              })
              .join(', ');
            
            const archiveEntryData = {
              title: `Game #${createdGame.scheduledGameId} - ${createdGame.teamSize === 'custom' ? createdGame.customTeamSize : createdGame.teamSize}`,
              content: `Test game created for development/testing purposes.\n\n**Game Type:** ${createdGame.gameType === 'elo' ? 'ELO' : 'Normal'}\n**Participants:** ${participantSummary || 'None specified'}\n**Game Version:** ${createdGame.gameVersion || 'N/A'}\n**Game Length:** ${createdGame.gameLength ? `${Math.floor(createdGame.gameLength / 60)} minutes` : 'N/A'}`,
              author: createdGame.scheduledByName,
              createdByDiscordId: createdGame.scheduledByDiscordId,
              createdByName: createdGame.scheduledByName,
              replayUrl: '',
              mediaType: 'none' as const,
              sectionOrder: ['text'] as const,
              dateInfo: {
                type: 'single' as const,
                singleDate: createdGame.scheduledDateTime,
              },
              isDeleted: false,
              deletedAt: null,
              createdAt: adminTimestamp.now(),
              updatedAt: adminTimestamp.now(),
            };

            const archiveDocRef = await adminDb.collection('archives').add(archiveEntryData);
            archiveId = archiveDocRef.id;
            
            // Link archive and game to scheduled game
            await updateScheduledGame(gameId, { 
              archiveId,
              gameId: createdGameId,
            });
            
            logger.info('Archive entry created for archived scheduled game', { 
              gameId, 
              archiveId,
              createdGameId,
              scheduledGameId: createdGame.scheduledGameId 
            });
          }
        } catch (archiveError) {
          // Log error but don't fail the request - scheduled game was created successfully
          logError(archiveError instanceof Error ? archiveError : new Error(String(archiveError)), 'Failed to create game/archive entry for archived scheduled game', {
            component: 'api/scheduled-games',
            operation: 'create',
            gameId,
          });
        }
      }
      
      return res.status(201).json({ id: gameId, success: true, archiveId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const err = error as Error;
    logError(err, 'API request failed', {
      component: 'api/scheduled-games',
      operation: 'create',
      method: req.method,
      url: req.url,
    });
    
    // In development, include more error details
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;
    
    // Also log stack trace in development
    if (process.env.NODE_ENV !== 'production') {
      logger.error('Error stack', err, { stack: err.stack });
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && { 
        stack: err.stack,
        details: err.message 
      })
    });
  }
}

