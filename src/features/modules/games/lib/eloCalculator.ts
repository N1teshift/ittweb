import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('eloCalculator');

/**
 * ELO Calculator
 * 
 * Handles ELO rating calculations
 * TODO: Implement ELO calculation logic
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

    const { getGameById } = await import('./gameService');
    const { getPlayerStats, updatePlayerStats } = await import('../../players/lib/playerService');
    
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
    const drawerElos = drawers.map(p => playerElos.get(p.name.toLowerCase().trim()) ?? STARTING_ELO);

    const winnerTeamElo = calculateTeamElo(winnerElos);
    const loserTeamElo = calculateTeamElo(loserElos);
    const drawerTeamElo = calculateTeamElo(drawerElos);

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
    const { getFirestoreAdmin, isServerSide, getAdminTimestamp } = await import('@/features/infrastructure/api/firebase/admin');
    const { doc, updateDoc, getDocs, collection } = await import('firebase/firestore');
    const { getFirestoreInstance } = await import('@/features/infrastructure/api/firebase');

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
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
 */
export async function recalculateFromGame(gameId: string): Promise<void> {
  try {
    logger.info('Recalculating ELO from game', { gameId });

    // TODO: Implement full recalculation
    // This would require:
    // 1. Getting all games after this gameId
    // 2. Rolling back ELO changes
    // 3. Recalculating in order

    logger.warn('recalculateFromGame not fully implemented', { gameId });
    throw new Error('Not yet fully implemented');
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to recalculate ELO from game', err, { gameId });
    throw err;
  }
}

