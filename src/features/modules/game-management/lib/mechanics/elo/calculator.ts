import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('eloCalculator');

/**
 * ELO Calculator
 *
 * Handles ELO rating calculations
 */

/**
 * Default K-factor for ELO calculations
 */
export const DEFAULT_K_FACTOR = 32;

/**
 * Starting ELO for new players
 */
export const STARTING_ELO = 1000;

/**
 * Calculate ELO change for a single match
 * 
 * @param playerElo - Current ELO of the player
 * @param opponentElo - Current ELO of the opponent (or average team ELO)
 * @param result - Match result: 'win', 'loss', or 'draw'
 * @param kFactor - K-factor (default: 32)
 * @returns ELO change (positive for win, negative for loss)
 */
export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw',
  kFactor: number = DEFAULT_K_FACTOR
): number {
  // Calculate expected score using ELO formula
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));

  // Determine actual score based on result
  const actualScore = result === 'win' ? 1 : result === 'loss' ? 0 : 0.5;

  // Calculate ELO change: K * (actual - expected)
  const eloChange = kFactor * (actualScore - expectedScore);

  // Round to 2 decimal places
  return Math.round(eloChange * 100) / 100;
}

/**
 * Calculate average ELO for a team
 */
export function calculateTeamElo(playerElos: number[]): number {
  if (playerElos.length === 0) {
    return STARTING_ELO;
  }

  const sum = playerElos.reduce((acc, elo) => acc + elo, 0);
  return Math.round((sum / playerElos.length) * 100) / 100;
}

/**
 * Update ELO scores for all players in a game
 */
export async function updateEloScores(gameId: string): Promise<void> {
  try {
    logger.info('Updating ELO scores', { gameId });

    const { getGameById } = await import('@/features/modules/game-management/games/lib/gameService');
    const { getPlayerStats, updatePlayerStats } = await import('@/features/modules/community/players/lib/playerService');

    const game = await getGameById(gameId);
    if (!game || !game.players || game.players.length < 2) {
      logger.warn('Game not found or invalid for ELO update', { gameId });
      return;
    }

    // Group players by team (flag)
    const winners = game.players.filter(p => p.flag === 'winner');
    const losers = game.players.filter(p => p.flag === 'loser');
    const drawers = game.players.filter(p => p.flag === 'drawer');

    // Get current ELOs for all players
    const playerElos: Map<string, number> = new Map();
    const category = game.category || 'default';

    for (const player of game.players) {
      const normalizedName = player.name.toLowerCase().trim();
      const stats = await getPlayerStats(normalizedName);
      const currentElo = stats?.categories[category]?.score ?? STARTING_ELO;
      playerElos.set(normalizedName, currentElo);
    }

    // Calculate team ELOs
    const winnerElos = winners.map(p => playerElos.get(p.name.toLowerCase().trim()) ?? STARTING_ELO);
    const loserElos = losers.map(p => playerElos.get(p.name.toLowerCase().trim()) ?? STARTING_ELO);

    const winnerTeamElo = calculateTeamElo(winnerElos);
    const loserTeamElo = calculateTeamElo(loserElos);

    // Calculate ELO changes
    const eloChanges: Map<string, number> = new Map();

    // Winners vs Losers
    if (winners.length > 0 && losers.length > 0) {
      for (const winner of winners) {
        const playerElo = playerElos.get(winner.name.toLowerCase().trim()) ?? STARTING_ELO;
        const change = calculateEloChange(playerElo, loserTeamElo, 'win');
        eloChanges.set(winner.name.toLowerCase().trim(), change);
      }
      for (const loser of losers) {
        const playerElo = playerElos.get(loser.name.toLowerCase().trim()) ?? STARTING_ELO;
        const change = calculateEloChange(playerElo, winnerTeamElo, 'loss');
        eloChanges.set(loser.name.toLowerCase().trim(), change);
      }
    }

    // Drawers (if any)
    if (drawers.length > 0) {
      const opponentElo = winners.length > 0 ? winnerTeamElo : loserTeamElo;
      for (const drawer of drawers) {
        const playerElo = playerElos.get(drawer.name.toLowerCase().trim()) ?? STARTING_ELO;
        const change = calculateEloChange(playerElo, opponentElo, 'draw');
        eloChanges.set(drawer.name.toLowerCase().trim(), change);
      }
    }

    // Update game players with ELO changes
    const { getFirestoreAdmin, isServerSide } = await import('@/features/infrastructure/api/firebase/admin');
    const { doc, updateDoc, getDocs, collection } = await import('firebase/firestore');
    const { getFirestoreInstance } = await import('@/features/infrastructure/api/firebase');

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const gameRef = adminDb.collection('games').doc(gameId);
      const playersSnapshot = await gameRef.collection('players').get();

      for (const playerDoc of playersSnapshot.docs) {
        const playerData = playerDoc.data();
        const normalizedName = playerData.name.toLowerCase().trim();
        const eloChange = eloChanges.get(normalizedName) ?? 0;
        const eloBefore = playerElos.get(normalizedName) ?? STARTING_ELO;
        const eloAfter = eloBefore + eloChange;

        await playerDoc.ref.update({
          elochange: eloChange,
          eloBefore,
          eloAfter,
        });
      }
    } else {
      const db = getFirestoreInstance();
      const playersCollection = collection(db, 'games', gameId, 'players');
      const playersSnapshot = await getDocs(playersCollection);

      for (const playerDoc of playersSnapshot.docs) {
        const playerData = playerDoc.data();
        const normalizedName = playerData.name.toLowerCase().trim();
        const eloChange = eloChanges.get(normalizedName) ?? 0;
        const eloBefore = playerElos.get(normalizedName) ?? STARTING_ELO;
        const eloAfter = eloBefore + eloChange;

        await updateDoc(doc(db, 'games', gameId, 'players', playerDoc.id), {
          elochange: eloChange,
          eloBefore,
          eloAfter,
        });
      }
    }

    // Update player stats (this function processes all players in the game)
    await updatePlayerStats(gameId);

    logger.info('ELO scores updated', { gameId, playersUpdated: game.players.length });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to update ELO scores', err, { gameId });
    throw err;
  }
}

/**
 * Recalculate ELO from a specific game forward
 * Used when fixing incorrect games
 * 
 * This function:
 * 1. Gets the target game and all games after it
 * 2. Rolls back ELO changes for all affected players to their state before the target game
 * 3. Recalculates ELO for the target game and all subsequent games in chronological order
 */
export async function recalculateFromGame(gameId: string): Promise<void> {
  try {
    logger.info('Recalculating ELO from game', { gameId });

    const { getGameById, getGames } = await import('@/features/modules/game-management/games/lib/gameService');
    const { getPlayerStats } = await import('@/features/modules/community/players/lib/playerService');

    // Get the target game
    const targetGame = await getGameById(gameId);
    if (!targetGame || !targetGame.players || targetGame.players.length < 2) {
      throw new Error(`Game not found or invalid: ${gameId}`);
    }

    // Only recalculate completed games (scheduled games don't affect ELO)
    if (targetGame.gameState !== 'completed') {
      throw new Error('Can only recalculate ELO for completed games');
    }

    if (!targetGame.datetime) {
      throw new Error('Game must have a datetime to recalculate ELO');
    }

    const targetDate = typeof targetGame.datetime === 'string'
      ? new Date(targetGame.datetime)
      : targetGame.datetime.toDate();

    // Get all games before the target game to find player ELOs before this game
    const gamesBefore = await getGames({
      gameState: 'completed',
      endDate: targetDate.toISOString(),
      limit: 10000, // Get all games before
    });

    // Get all games from the target game forward (including the target game)
    const gamesAfter = await getGames({
      gameState: 'completed',
      startDate: targetDate.toISOString(),
      limit: 10000, // Get all games after
    });

    // Collect all unique players from target game and subsequent games
    const affectedPlayers = new Set<string>();
    targetGame.players.forEach(p => affectedPlayers.add(p.name.toLowerCase().trim()));
    gamesAfter.games.forEach(game => {
      if (game.playerNames) {
        game.playerNames.forEach(name => affectedPlayers.add(name.toLowerCase().trim()));
      }
    });

    // Get ELOs for all affected players before the target game
    const playerElosBefore: Map<string, number> = new Map();
    const category = targetGame.category || 'default';

    for (const playerName of affectedPlayers) {
      // Find the player's last game before the target game
      let lastElo = STARTING_ELO;

      // Sort games before by datetime descending to find most recent
      const playerGamesBefore = gamesBefore.games
        .filter(g => g.playerNames?.some(n => n.toLowerCase().trim() === playerName))
        .sort((a, b) => {
          const dateA = typeof a.datetime === 'string' ? new Date(a.datetime).getTime() : a.datetime?.toMillis() || 0;
          const dateB = typeof b.datetime === 'string' ? new Date(b.datetime).getTime() : b.datetime?.toMillis() || 0;
          return dateB - dateA; // Descending
        });

      if (playerGamesBefore.length > 0) {
        // Get the most recent game for this player
        const mostRecentGame = await getGameById(playerGamesBefore[0].id);
        if (mostRecentGame?.players) {
          const playerInGame = mostRecentGame.players.find(
            p => p.name.toLowerCase().trim() === playerName
          );
          if (playerInGame?.eloAfter !== undefined) {
            lastElo = playerInGame.eloAfter;
          } else {
            // Fallback to current stats
            const stats = await getPlayerStats(playerName);
            lastElo = stats?.categories[category]?.score ?? STARTING_ELO;
          }
        } else {
          // Fallback to current stats
          const stats = await getPlayerStats(playerName);
          lastElo = stats?.categories[category]?.score ?? STARTING_ELO;
        }
      } else {
        // Player has no games before, use current stats or starting ELO
        const stats = await getPlayerStats(playerName);
        lastElo = stats?.categories[category]?.score ?? STARTING_ELO;
      }

      playerElosBefore.set(playerName, lastElo);
    }

    // Roll back player stats to ELOs before the target game
    // This is done by updating player stats directly
    const { getFirestoreAdmin, isServerSide } = await import('@/features/infrastructure/api/firebase/admin');
    const { doc, updateDoc, getDocs, collection, query, where } = await import('firebase/firestore');
    const { getFirestoreInstance } = await import('@/features/infrastructure/api/firebase');

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const playersCollection = adminDb.collection('players');

      for (const [playerName, elo] of playerElosBefore.entries()) {
        const playerQuery = playersCollection.where('name', '==', playerName);
        const playerSnapshot = await playerQuery.get();

        if (!playerSnapshot.empty) {
          const playerDoc = playerSnapshot.docs[0];
          const playerData = playerDoc.data();
          const categories = playerData.categories || {};

          categories[category] = {
            ...categories[category],
            score: elo,
          };

          await playerDoc.ref.update({ categories });
        }
      }
    } else {
      const db = getFirestoreInstance();
      const playersCollection = collection(db, 'players');

      for (const [playerName, elo] of playerElosBefore.entries()) {
        const playerQuery = query(playersCollection, where('name', '==', playerName));
        const playerSnapshot = await getDocs(playerQuery);

        if (!playerSnapshot.empty) {
          const playerDoc = playerSnapshot.docs[0];
          const playerData = playerDoc.data();
          const categories = playerData.categories || {};

          categories[category] = {
            ...categories[category],
            score: elo,
          };

          await updateDoc(doc(db, 'players', playerDoc.id), { categories });
        }
      }
    }

    // Sort all games from target forward by datetime
    const allGamesToRecalculate = [
      targetGame,
      ...gamesAfter.games.filter(g => g.id !== gameId),
    ].sort((a, b) => {
      const dateA = typeof a.datetime === 'string'
        ? new Date(a.datetime).getTime()
        : a.datetime?.toMillis() || 0;
      const dateB = typeof b.datetime === 'string'
        ? new Date(b.datetime).getTime()
        : b.datetime?.toMillis() || 0;
      return dateA - dateB; // Ascending order
    });

    // Recalculate ELO for each game in chronological order
    for (const game of allGamesToRecalculate) {
      if (game.id) {
        await updateEloScores(game.id);
        logger.info('Recalculated ELO for game', { gameId: game.id, gameIdNumber: game.gameId });
      }
    }

    logger.info('ELO recalculation completed', {
      gameId,
      gamesRecalculated: allGamesToRecalculate.length,
      playersAffected: affectedPlayers.size,
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to recalculate ELO from game', err, { gameId });
    throw err;
  }
}

