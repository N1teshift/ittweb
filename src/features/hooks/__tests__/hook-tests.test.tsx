import { act, renderHook, waitFor } from '@testing-library/react';
import { useGames } from '../../modules/games/hooks/useGames';
import { useGame } from '../../modules/games/hooks/useGame';
import { usePlayerStats } from '../../modules/players/hooks/usePlayerStats';
import { useStandings } from '../../modules/standings/hooks/useStandings';
import { useItemsData } from '../../modules/guides/hooks/useItemsData';
import { useIconMapperData } from '../../modules/tools/useIconMapperData';
import { useArchiveBaseState } from '../../modules/archives/hooks/useArchiveBaseState';
import {
  useArchiveHandlers,
} from '../../modules/archives/hooks/useArchiveHandlers';
import { useArchiveMedia, uploadSelectedMedia } from '../../modules/archives/hooks/useArchiveMedia';
import { useArchivesActions } from '../../modules/archives/hooks/useArchivesActions';
import { useArchivesPage } from '../../modules/archives/hooks/useArchivesPage';
import { useNewPostForm } from '../../modules/blog/hooks/useNewPostForm';
import { useEditPostForm } from '../../modules/blog/hooks/useEditPostForm';
import { useFallbackTranslation } from '../../shared/hooks/useFallbackTranslation';
import type { ArchiveEntry } from '@/types/archive';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ status: 'authenticated' })),
  signIn: jest.fn(),
}));

jest.mock('@/features/shared/lib/archiveService', () => ({
  extractYouTubeId: jest.fn((url: string) => (url.includes('youtube') ? 'id123' : null)),
  extractTwitchClipId: jest.fn((url: string) => (url.includes('twitch') ? 'clip123' : null)),
  uploadImage: jest.fn(async () => 'https://example.com/image.jpg'),
  uploadImages: jest.fn(async () => ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']),
  uploadReplay: jest.fn(async () => 'https://example.com/replay.w3g'),
  getArchiveEntries: jest.fn(async () => []),
  deleteArchiveEntry: jest.fn(async () => undefined),
  sortArchiveEntries: jest.fn((entries: ArchiveEntry[]) => entries.slice().reverse()),
}));

jest.mock('@/features/shared/utils/loggerUtils', () => ({
  createComponentLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  })),
  logError: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => (key === 'existing' ? 'existing-translation' : key),
    i18n: {
      t: (key: string, options?: Record<string, unknown>) =>
        options?.ns === 'fallback' ? `translated:${key}` : key,
    },
    ready: true,
  })),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../modules/guides/hooks/useItemsData', () => ({
  useItemsData: jest.fn(() => ({
    items: [{ name: 'Sword', category: 'weapons' }, { name: 'Tower', category: 'buildings' }],
    meta: { total: 2, buildingsTotal: 1, count: 2 },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/features/shared/lib/TranslationNamespaceContext', () => ({
  useTranslationNamespace: () => ({ translationNs: ['primary', 'fallback'] }),
}));

const mockFetch = jest.fn();

function createFetchResponse(data: unknown, ok = true, statusText = 'OK') {
  return Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    statusText,
    json: () => Promise.resolve(data),
  } as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
  (global as unknown as { fetch: typeof fetch }).fetch = mockFetch;
});

describe('game hooks', () => {
  it('fetches games on mount and exposes response data', async () => {
    mockFetch.mockResolvedValue(
      createFetchResponse({ success: true, data: { games: [{ id: '1' }], hasMore: true, nextCursor: 'abc' } })
    );

    const { result } = renderHook(() => useGames());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.games).toEqual([{ id: '1' }]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.nextCursor).toBe('abc');
  });

  it('applies filters when refetching games', async () => {
    mockFetch.mockResolvedValue(
      createFetchResponse({ success: true, data: { games: [], hasMore: false, nextCursor: undefined } })
    );

    const { rerender } = renderHook((props: any) => useGames(props), {
      initialProps: { category: 'fun', page: 1 },
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    rerender({ category: 'serious', page: 2 });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    const secondCall = mockFetch.mock.calls[1]?.[0] as string;
    expect(secondCall).toContain('category=serious');
    expect(secondCall).toContain('page=2');
  });

  it('fetches a single game by id and handles missing id', async () => {
    mockFetch.mockResolvedValue(createFetchResponse({ success: true, data: { id: '42' } }));

    const { result, rerender } = renderHook(({ id }) => useGame(id), {
      initialProps: { id: '' },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).not.toHaveBeenCalled();

    rerender({ id: '42' });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.game).toEqual({ id: '42' });
  });
});

describe('player and standings hooks', () => {
  it('fetches player stats with filters', async () => {
    mockFetch.mockResolvedValue(
      createFetchResponse({ success: true, data: { name: 'Player', games: [] } })
    );

    const { result } = renderHook(() =>
      usePlayerStats('Player', { category: 'pvp', includeGames: true, startDate: '2024-01-01' })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.player?.name).toBe('Player');
    const callUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(callUrl).toContain('category=pvp');
    expect(callUrl).toContain('includeGames=true');
    expect(callUrl).toContain('startDate=2024-01-01');
  });

  it('fetches standings and exposes pagination metadata', async () => {
    mockFetch.mockResolvedValue(
      createFetchResponse({ success: true, data: { standings: [{ name: 'Top' }], total: 10, page: 2, hasMore: true } })
    );

    const { result } = renderHook(() => useStandings({ page: 2, limit: 20 }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.standings[0]).toEqual({ name: 'Top' });
    expect(result.current.total).toBe(10);
    expect(result.current.page).toBe(2);
    expect(result.current.hasMore).toBe(true);
  });
});

describe('archive hooks', () => {
  const sampleEntry: ArchiveEntry = {
    id: '1',
    title: 'Story',
    creatorName: 'Author',
    content: 'Body',
    entryType: 'story',
    sectionOrder: ['content'],
    images: ['https://example.com/one.png'],
    videoUrl: 'https://youtube.com/watch?v=123',
    twitchClipUrl: '',
    dateInfo: { type: 'single', singleDate: '2024-01-01', approximateText: '' },
    createdAt: '',
    updatedAt: '',
  };

  it('initializes archive state for create and edit modes', () => {
    const { result: createResult } = renderHook(() => useArchiveBaseState('create'));
    expect(createResult.current.formData.title).toBe('');
    expect(createResult.current.sectionOrder.length).toBeGreaterThan(0);

    const { result: editResult } = renderHook(() => useArchiveBaseState('edit', sampleEntry));
    expect(editResult.current.formData.title).toBe('Story');
    expect(editResult.current.currentImages).toContain('https://example.com/one.png');
    expect(editResult.current.existingReplayName).toBe('');
  });

  it('handles media interactions and validation through handlers', () => {
    const setFormData = jest.fn();
    const setError = jest.fn();
    const setImageFile = jest.fn();
    const setImageFiles = jest.fn();
    const setReplayFile = jest.fn();
    const setCurrentImages = jest.fn();
    const setSectionOrder = jest.fn();
    const setExistingReplayUrl = jest.fn();

    const handlers = useArchiveHandlers({
      setFormData,
      imageFile: null,
      imageFiles: [],
      setImageFile,
      setImageFiles,
      setReplayFile,
      setCurrentImages,
      setSectionOrder,
      setError,
      setExistingReplayUrl,
    });

    const invalidFile = new File(['content'], 'note.txt', { type: 'text/plain' });
    const imageEvent = {
      target: { files: [invalidFile] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handlers.handleImageUpload(imageEvent);
    expect(setError).toHaveBeenCalledWith('Please select only image files');

    const urlEvent = { target: { value: 'https://invalid.com' } } as React.ChangeEvent<HTMLInputElement>;
    handlers.handleVideoUrlChange(urlEvent);
    expect(setFormData).toHaveBeenCalledWith(expect.any(Function));

    const reorderEvent = { target: { files: [new File([''], 'demo.w3g', { type: 'application/octet-stream' })] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handlers.handleReplayUpload(reorderEvent);
    expect(setReplayFile).toHaveBeenCalled();
  });

  it('creates preview URLs and cleans them up', () => {
    const file = new File(['data'], 'image.png', { type: 'image/png' });
    const originalCreate = URL.createObjectURL;
    const originalRevoke = (URL as any).revokeObjectURL;
    (URL as any).createObjectURL = jest.fn(() => 'blob:preview');
    (URL as any).revokeObjectURL = jest.fn();
    const revokeSpy = jest.spyOn(URL as any, 'revokeObjectURL');

    const { result, unmount } = renderHook(() => useArchiveMedia(file, []));
    expect(result.current.imagePreviewUrls.length).toBe(1);

    unmount();
    expect(revokeSpy).toHaveBeenCalled();
    revokeSpy.mockRestore();
    (URL as any).createObjectURL = originalCreate;
    (URL as any).revokeObjectURL = originalRevoke;
  });

  it('uploads selected media based on provided files', async () => {
    const { uploadImage, uploadImages, uploadReplay } = await import('@/features/shared/lib/archiveService');
    const image = new File(['data'], 'one.png', { type: 'image/png' });
    const replay = new File(['data'], 'game.w3g', { type: 'application/octet-stream' });

    const resultWithImages = await uploadSelectedMedia(null, [image], [], 'create', null);
    expect(uploadImages).toHaveBeenCalled();
    expect(resultWithImages.images).toHaveLength(2);

    const resultWithReplay = await uploadSelectedMedia(null, [], [], 'create', replay);
    expect(uploadReplay).toHaveBeenCalled();
    expect(resultWithReplay.replayUrl).toContain('replay');
  });

  it('loads and sorts archives while exposing UI helpers', async () => {
    const setEntries = jest.fn();
    const setLoading = jest.fn();
    const setError = jest.fn();
    const setShowForm = jest.fn();
    const setShowEditForm = jest.fn();
    const setEditingEntry = jest.fn();
    const setShowImageModal = jest.fn();
    const setModalImage = jest.fn();
    const setSortOrder = jest.fn();

    const { result } = renderHook(() =>
      useArchivesActions({
        setEntries,
        setLoading,
        setError,
        setShowForm,
        setShowEditForm,
        setEditingEntry,
        setShowImageModal,
        setModalImage,
        setSortOrder,
        entries: [],
        sortOrder: 'newest',
      })
    );

    await act(async () => {
      await result.current.loadEntries();
    });
    expect(setEntries).toHaveBeenCalledWith([]);

    act(() => {
      result.current.handleSortOrderChange('oldest');
    });
    expect(setSortOrder).toHaveBeenCalledWith('oldest');

    act(() => {
      result.current.handleImageClick('https://example.com/image.jpg', 'Image');
    });
    expect(setModalImage).toHaveBeenCalledWith({ url: 'https://example.com/image.jpg', title: 'Image' });
  });

  it('computes dated and undated entries and resets forms', () => {
    const { result } = renderHook(() => useArchivesPage());

    act(() => {
      result.current.setEntries([
        { ...sampleEntry, id: '1', dateInfo: { type: 'single', singleDate: '2024-01-01', approximateText: '' } },
        { ...sampleEntry, id: '2', dateInfo: { type: 'undated', approximateText: 'Unknown' } as any },
      ]);
    });

    expect(result.current.datedEntries).toHaveLength(1);
    expect(result.current.undatedEntries).toHaveLength(1);

    act(() => {
      result.current.setShowForm(true);
      result.current.resetFormStates();
    });

    expect(result.current.state.showForm).toBe(false);
    expect(result.current.state.editingEntry).toBeNull();
  });
});

describe('blog hooks', () => {
  it('initializes and updates new post form fields', () => {
    const { result } = renderHook(() => useNewPostForm());

    act(() => {
      result.current.handleFieldChange({
        target: { name: 'title', value: 'Hello World', type: 'text' },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formState.title).toBe('Hello World');
    expect(result.current.formState.slug).toBe('hello-world');
  });

  it('prefills edit post form and tracks changes', () => {
    mockFetch.mockResolvedValue(createFetchResponse({ id: '1' }));

    const { result } = renderHook(() =>
      useEditPostForm('1', {
        id: '1',
        title: 'Existing',
        slug: 'existing',
        date: '2024-01-01',
        excerpt: 'Old',
        content: 'Content',
        published: true,
      })
    );

    expect(result.current.formState.title).toBe('Existing');
    act(() => {
      result.current.handleFieldChange({
        target: { name: 'title', value: 'Updated', type: 'text' },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.formState.title).toBe('Updated');
  });
});

describe('guide and tools hooks', () => {
  it('loads items data and supports refetch', async () => {
    mockFetch.mockResolvedValue(
      createFetchResponse({ items: [{ name: 'Item' }], meta: { total: 1, buildingsTotal: 0, count: 1 } })
    );

    const { result } = renderHook(() => useItemsData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items.length).toBeGreaterThan(0);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
  });

  it('manages icon mappings, deletion marks, and stats', async () => {
    mockFetch.mockResolvedValue(createFetchResponse([{ path: 'icon.png' }]));

    const { result } = renderHook(() => useIconMapperData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.icons).toEqual([{ path: 'icon.png' }]);

    act(() => {
      result.current.updateMapping('items', 'icon.png', 'Sword');
      result.current.toggleMarkForDeletion('icon.png');
    });

    expect(result.current.mappings.items['Sword']).toBe('icon.png');
    expect(result.current.isMarkedForDeletion('icon.png')).toBe(true);
    expect(result.current.entityStats.length).toBeGreaterThan(0);
  });
});

describe('shared hooks', () => {
  it('falls back to secondary namespace translation when key is missing', () => {
    const { result } = renderHook(() => useFallbackTranslation(['primary', 'fallback']));
    expect(result.current.t('missing.key')).toBe('translated:missing.key');
    expect(result.current.t('existing')).toBe('existing-translation');
  });
});
