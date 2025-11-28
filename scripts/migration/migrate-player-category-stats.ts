/**
 * Migration Script: Backfill playerCategoryStats Collection
 * 
 * This script migrates existing playerStats data to the new denormalized
 * playerCategoryStats collection for optimized standings queries.
 * 
 * Usage:
 *   npx tsx scripts/migration/migrate-player-category-stats.ts
 * 
 * Prerequisites:
 *   - Firebase Admin credentials configured (FIREBASE_SERVICE_ACCOUNT_KEY)
 *   - Run from project root
 */

import { initializeFirebaseAdmin, getFirestoreAdmin } from '../../src/features/infrastructure/api/firebase/admin';
import { upsertPlayerCategoryStats } from '../../src/features/modules/standings/lib/playerCategoryStatsService';
import { normalizePlayerName } from '../../src/features/modules/players/lib/playerService';
import { createComponentLogger } from '../../src/features/infrastructure/logging';

const logger = createComponentLogger('migratePlayerCategoryStats');
const PLAYER_STATS_COLLECTION = 'playerStats';

interface PlayerStatsDocument {
  id: string;
  name: string;
  categories: {
    [category: string]: {
      wins: number;
      losses: number;
      draws: number;
      score: number;
      games?: number;
    };
  };
  lastPlayed?: {
    toDate: () => Date;
  };
}

/**
 * Migrate all player stats to denormalized collection
 */
async function migratePlayerCategoryStats(): Promise<void> {
  try {
    logger.info('Starting migration of player category stats...');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const adminDb = getFirestoreAdmin();

    // Get all player stats
    logger.info('Fetching all player stats documents...');
    const snapshot = await adminDb.collection(PLAYER_STATS_COLLECTION).get();
    
    logger.info(`Found ${snapshot.size} player documents to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    // Process each player document
    for (const doc of snapshot.docs) {
      try {
        const data = doc.data() as PlayerStatsDocument;
        const playerId = doc.id;
        const playerName = data.name || playerId;

        if (!data.categories || Object.keys(data.categories).length === 0) {
          logger.debug(`Skipping player ${playerId} - no categories`);
          skipped++;
          continue;
        }

        // Process each category
        for (const [category, categoryStats] of Object.entries(data.categories)) {
          const games = categoryStats.games || (categoryStats.wins + categoryStats.losses + categoryStats.draws);
          
          if (games === 0) {
            logger.debug(`Skipping player ${playerId} category ${category} - no games`);
            continue;
          }

          const lastPlayed = data.lastPlayed?.toDate();

          // Migrate to denormalized collection
          await upsertPlayerCategoryStats(
            playerId,
            playerName,
            category,
            {
              wins: categoryStats.wins || 0,
              losses: categoryStats.losses || 0,
              draws: categoryStats.draws || 0,
              score: categoryStats.score || 1000,
              lastPlayed: lastPlayed,
            }
          );

          migrated++;
        }

        // Log progress every 10 players
        if ((migrated + skipped + errors) % 10 === 0) {
          logger.info(`Progress: ${migrated} categories migrated, ${skipped} skipped, ${errors} errors`);
        }
      } catch (error) {
        errors++;
        const err = error as Error;
        logger.error(`Error migrating player ${doc.id}: ${err.message}`, {
          error: err.message,
          stack: err.stack,
        });
      }
    }

    logger.info('Migration completed!', {
      total: snapshot.size,
      migrated,
      skipped,
      errors,
    });

    if (errors > 0) {
      logger.warn(`${errors} errors occurred during migration. Check logs for details.`);
      process.exit(1);
    }
  } catch (error) {
    const err = error as Error;
    logger.error('Migration failed', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migratePlayerCategoryStats()
    .then(() => {
      logger.info('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed', { error });
      process.exit(1);
    });
}

export { migratePlayerCategoryStats };

