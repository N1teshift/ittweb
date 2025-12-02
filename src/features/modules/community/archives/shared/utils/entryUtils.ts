/**
 * Extract entry ID from ArchiveEntry ID (entries have prefix "entry-")
 */
export function extractEntryId(archiveEntryId: string): string | null {
  if (archiveEntryId.startsWith('entry-')) {
    return archiveEntryId.replace('entry-', '');
  }
  return null;
}



