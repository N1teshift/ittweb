import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '@/features/infrastructure/api/firebase';
import { getFirestoreAdmin, isServerSide, getAdminTimestamp } from '@/features/infrastructure/api/firebase/admin';
import { CreateScheduledGame } from '@/types/scheduledGame';
import { createComponentLogger, logError } from '@/features/infrastructure/logging';

const GAMES_COLLECTION = 'games'; // Unified games collection (scheduled and completed)
const logger = createComponentLogger('scheduledGameService');

/**
 * Update a scheduled game
 */
export async function updateScheduledGame(
  id: string, 
  updates: Partial<CreateScheduledGame> & { 
    status?: 'scheduled' | 'ongoing' | 'awaiting_replay' | 'archived' | 'cancelled';
    linkedGameDocumentId?: string;
    linkedArchiveDocumentId?: string;
  }
): Promise<void> {
  try {
    logger.info('Updating scheduled game', { id });

    // Only extract fields that are safe to update
    const updateData: Record<string, unknown> = {};
    
    // Handle status
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    
    // Handle link fields
    if (updates.linkedGameDocumentId !== undefined) {
      updateData.linkedGameDocumentId = updates.linkedGameDocumentId;
    }
    if (updates.linkedArchiveDocumentId !== undefined) {
      updateData.linkedArchiveDocumentId = updates.linkedArchiveDocumentId;
    }
    
    // Handle scheduledDateTime (convert to Timestamp if provided)
    if (updates.scheduledDateTime !== undefined && typeof updates.scheduledDateTime === 'string') {
      const date = new Date(updates.scheduledDateTime);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid scheduledDateTime: ${updates.scheduledDateTime}`);
      }
      if (isServerSide()) {
        const adminTimestamp = getAdminTimestamp();
        updateData.scheduledDateTime = adminTimestamp.fromDate(date);
        updateData.scheduledDateTimeString = updates.scheduledDateTime;
      } else {
        updateData.scheduledDateTime = Timestamp.fromDate(date);
        updateData.scheduledDateTimeString = updates.scheduledDateTime;
      }
    }
    
    // Handle other optional fields from CreateScheduledGame (only if they're strings/numbers, not Timestamps)
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
    if (updates.teamSize !== undefined) updateData.teamSize = updates.teamSize;
    if (updates.customTeamSize !== undefined) updateData.customTeamSize = updates.customTeamSize;
    if (updates.gameType !== undefined) updateData.gameType = updates.gameType;
    if (updates.gameVersion !== undefined) updateData.gameVersion = updates.gameVersion;
    if (updates.gameLength !== undefined) updateData.gameLength = updates.gameLength;
    if (updates.modes !== undefined) updateData.modes = updates.modes;
    if (updates.participants !== undefined) updateData.participants = updates.participants;
    if (updates.creatorName !== undefined) updateData.creatorName = updates.creatorName;
    if (updates.createdByDiscordId !== undefined) updateData.createdByDiscordId = updates.createdByDiscordId;
    
    // Handle submittedAt (convert to Timestamp if provided as string)
    if (updates.submittedAt !== undefined) {
      if (typeof updates.submittedAt === 'string') {
        const date = new Date(updates.submittedAt);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid submittedAt: ${updates.submittedAt}`);
        }
        if (isServerSide()) {
          const adminTimestamp = getAdminTimestamp();
          updateData.submittedAt = adminTimestamp.fromDate(date);
        } else {
          updateData.submittedAt = Timestamp.fromDate(date);
        }
      } else {
        // If it's already a Timestamp, use it directly
        updateData.submittedAt = updates.submittedAt;
      }
    }

    // Only update if we have data to update
    if (Object.keys(updateData).length === 0) {
      logger.warn('No valid fields to update', { id });
      return;
    }

    if (isServerSide()) {
      const adminDb = getFirestoreAdmin();
      const adminTimestamp = getAdminTimestamp();
      
      // Update in unified games collection
      await adminDb.collection(GAMES_COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: adminTimestamp.now(),
      });
    } else {
      const db = getFirestoreInstance();
      const docRef = doc(db, GAMES_COLLECTION, id);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now(),
      });
    }

    logger.info('Scheduled game updated', { id });
  } catch (error) {
    const err = error as Error;
    logError(err, 'Failed to update scheduled game', {
      component: 'scheduledGameService',
      operation: 'updateScheduledGame',
      id,
    });
    throw err;
  }
}

