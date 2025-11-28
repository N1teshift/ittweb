jest.mock('@/features/infrastructure/api/firebase', () => ({
  getFirestoreInstance: jest.fn(() => ({})),
  getStorageInstance: jest.fn(() => ({}))
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toMillis: () => Date.now() }))
  }
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn()
}));

import { extractTwitchClipId, extractYouTubeId, sortArchiveEntries } from './archiveService';
import { ArchiveEntry } from '@/types/archive';

describe('archiveService media parsing', () => {
  describe('extractYouTubeId', () => {
    it('parses various YouTube URL formats', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('returns null for invalid YouTube URLs', () => {
      expect(extractYouTubeId('https://example.com/watch?v=invalid')).toBeNull();
      expect(extractYouTubeId('')).toBeNull();
    });
  });

  describe('extractTwitchClipId', () => {
    it('parses clip URLs from different Twitch formats', () => {
      expect(extractTwitchClipId('https://clips.twitch.tv/FancyClipName')).toBe('FancyClipName');
      expect(extractTwitchClipId('https://www.twitch.tv/someone/clip/Legendary-Moment')).toBe('Legendary-Moment');
      expect(extractTwitchClipId('https://www.twitch.tv/?clip=GreatClip123')).toBe('GreatClip123');
    });

    it('returns null for non-Twitch URLs', () => {
      expect(extractTwitchClipId('https://example.com/clip/Legendary')).toBeNull();
      expect(extractTwitchClipId('')).toBeNull();
    });
  });
});

describe('archiveService archive sorting', () => {
  const baseEntry: Omit<ArchiveEntry, 'id'> = {
    title: 'Entry',
    content: 'Content',
    creatorName: 'Creator',
    dateInfo: { type: 'undated' },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02'
  };

  it('prioritizes dated entries before undated ones when sorting newest first', () => {
    const entries: ArchiveEntry[] = [
      { ...baseEntry, id: 'undated', dateInfo: { type: 'undated' }, createdAt: '2023-01-01' },
      { ...baseEntry, id: 'older', dateInfo: { type: 'single', singleDate: '2023-06-01' }, createdAt: '2023-06-02' },
      { ...baseEntry, id: 'newest', dateInfo: { type: 'single', singleDate: '2024-05-01' }, createdAt: '2024-05-02' }
    ];

    const sorted = sortArchiveEntries([...entries], 'newest');

    expect(sorted.map((entry) => entry.id)).toEqual(['newest', 'older', 'undated']);
  });

  it('sorts dated entries from oldest to newest when requested', () => {
    const entries: ArchiveEntry[] = [
      { ...baseEntry, id: 'latest', dateInfo: { type: 'single', singleDate: '2024-01-01' }, createdAt: '2024-01-02' },
      { ...baseEntry, id: 'middle', dateInfo: { type: 'single', singleDate: '2023-10-01' }, createdAt: '2023-10-02' },
      { ...baseEntry, id: 'earliest', dateInfo: { type: 'single', singleDate: '2022-05-01' }, createdAt: '2022-05-02' }
    ];

    const sorted = sortArchiveEntries([...entries], 'oldest');

    expect(sorted.map((entry) => entry.id)).toEqual(['earliest', 'middle', 'latest']);
  });
});
