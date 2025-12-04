import { useCallback } from 'react';
import type { ArchiveEntry } from '@/types/archive';
import type { Entry } from '@/types/entry';
import { convertEntryToArchiveEntry } from '@/features/modules/community/archives/shared/utils/entryToArchiveEntry';
import { timestampToIso } from '@/features/infrastructure/utils';
import { createComponentLogger } from '@/features/infrastructure/logging';

const logger = createComponentLogger('useTimelineEntries');

interface UseTimelineEntriesProps {
  setEntries: (entries: ArchiveEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for loading and managing timeline entries
 */
export function useTimelineEntries({
  setEntries,
  setLoading,
  setError,
}: UseTimelineEntriesProps) {
  const loadAllEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheBuster = `?t=${Date.now()}`;
      const [archiveEntriesResponse, regularEntriesResponse] = await Promise.all([
        fetch(`/api/archives${cacheBuster}`).catch((err) => {
          logger.error('Failed to fetch archive entries', err instanceof Error ? err : new Error(String(err)));
          return null;
        }),
        fetch(`/api/entries${cacheBuster}`).catch((err) => {
          logger.error('Failed to fetch regular entries', err instanceof Error ? err : new Error(String(err)));
          return null;
        }),
      ]);

      // Parse archive entries
      let archiveEntries: ArchiveEntry[] = [];
      if (archiveEntriesResponse && archiveEntriesResponse.ok) {
        const archiveData = await archiveEntriesResponse.json();
        const rawArchiveEntries = Array.isArray(archiveData) ? archiveData : (archiveData.data || []);
        archiveEntries = rawArchiveEntries.filter((entry: ArchiveEntry) => !entry.isDeleted);
      }

      // Parse regular entries
      let regularEntries: Entry[] = [];
      if (regularEntriesResponse && regularEntriesResponse.ok) {
        const entriesData = await regularEntriesResponse.json();
        regularEntries = Array.isArray(entriesData) ? entriesData : (entriesData.data || []);
      }

      // Filter out deleted entries and convert to ArchiveEntry format
      const nonDeletedEntries = regularEntries.filter((entry) => !entry.isDeleted);
      const convertedEntries = nonDeletedEntries.map(convertEntryToArchiveEntry);

      // Combine and sort by createdAt (newest first)
      const allEntries = [...archiveEntries, ...convertedEntries];
      const sortedEntries = allEntries.sort((a, b) => {
        const timeA = new Date(timestampToIso(a.createdAt)).getTime();
        const timeB = new Date(timestampToIso(b.createdAt)).getTime();
        return timeB - timeA;
      });

      setEntries(sortedEntries);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading entries');
      logger.error('Failed to load entries', error);
      setError('Failed to load timeline. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [setEntries, setLoading, setError]);

  const addNewEntry = useCallback(
    async (entryId: string, entries: ArchiveEntry[]) => {
      if (!entryId) {
        await loadAllEntries();
        return;
      }

      try {
        const entryResponse = await fetch(`/api/entries/${entryId}?t=${Date.now()}`, {
          cache: 'no-store',
        });

        if (entryResponse.ok) {
          const responseData = await entryResponse.json();
          const entryData = responseData.data || responseData;
          if (entryData) {
            const archiveEntry = convertEntryToArchiveEntry(entryData);

            let updated: ArchiveEntry[];
            if (entries.some((e) => e.id === `entry-${entryId}`)) {
              updated = entries.map((entry) =>
                entry.id === `entry-${entryId}` ? archiveEntry : entry
              );
            } else {
              updated = [archiveEntry, ...entries];
            }

            const sorted = updated.sort((a, b) => {
              const timeA = new Date(timestampToIso(a.createdAt)).getTime();
              const timeB = new Date(timestampToIso(b.createdAt)).getTime();
              return timeB - timeA;
            });
            setEntries(sorted);
          }
        }
      } catch (error) {
        logger.warn('Failed to fetch new entry after creation', { entryId, error });
        await loadAllEntries();
      }
    },
    [loadAllEntries, setEntries]
  );

  return {
    loadAllEntries,
    addNewEntry,
  };
}



