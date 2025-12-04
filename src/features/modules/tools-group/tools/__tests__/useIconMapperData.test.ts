import { act, renderHook, waitFor } from '@testing-library/react';
import { useIconMapperData } from '../hooks/useIconMapperData';
import type { ItemData } from '@/types/items';

const mockItemsData: ItemData[] = [
  { id: 'orb', name: 'Orb', category: 'weapons', description: 'Test orb' },
  { id: 'tower', name: 'Tower', category: 'buildings', description: 'Test tower' },
];

jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@/features/modules/content/guides/utils/iconMap', () => ({
  ICON_MAP: {
    abilities: { ChainLightning: 'abilities/chain-lightning.png' },
    items: { Orb: 'items/orb.png' },
    buildings: { Hut: 'buildings/hut.png' },
    trolls: { Warrior: 'trolls/warrior.png' },
    units: {},
  },
}));
jest.mock('@/features/modules/content/guides/data/abilities', () => ({ ABILITIES: [{ name: 'Chain Lightning' }] }));
jest.mock('@/features/modules/content/guides/data/units', () => ({
  BASE_TROLL_CLASSES: [{ name: 'Warrior' }],
  DERIVED_CLASSES: [{ name: 'Berserker' }],
}));
jest.mock('@/features/modules/content/guides/hooks/useItemsData', () => ({
  useItemsData: jest.fn(),
}));

const mockUseItemsData = jest.requireMock('@/features/modules/content/guides/hooks/useItemsData').useItemsData as jest.Mock;

describe('useIconMapperData', () => {
  beforeEach(() => {
    mockUseItemsData.mockReturnValue({ items: mockItemsData, isLoading: false });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates new icon mappings and updates existing entries', async () => {
    const { result } = renderHook(() => useIconMapperData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mappings.abilities.ChainLightning).toBe('abilities/chain-lightning.png');

    act(() => {
      result.current.updateMapping('abilities', 'abilities/new-icon.png', 'Fireball');
    });
    expect(result.current.mappings.abilities.Fireball).toBe('abilities/new-icon.png');

    act(() => {
      result.current.updateMapping('abilities', 'abilities/updated.png', 'Fireball');
    });
    expect(result.current.mappings.abilities.Fireball).toBe('abilities/updated.png');
  });

  it('removes icon mappings and reports existing filenames', async () => {
    const { result } = renderHook(() => useIconMapperData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.removeMapping('abilities', 'ChainLightning');
    });
    expect(result.current.mappings.abilities.ChainLightning).toBeUndefined();

    act(() => {
      result.current.removeMapping('items', 'Orb');
    });

    act(() => {
      result.current.updateMapping('items', 'items/orb.png', 'Orb of Frost');
    });
    expect(result.current.getExistingMapping('items', 'items/orb.png')).toBe('Orb of Frost');
  });

  it('tracks icons marked for deletion', async () => {
    const { result } = renderHook(() => useIconMapperData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.toggleMarkForDeletion('icons/a.png');
    });
    expect(result.current.isMarkedForDeletion('icons/a.png')).toBe(true);

    act(() => {
      result.current.toggleMarkForDeletion('icons/a.png');
    });
    expect(result.current.isMarkedForDeletion('icons/a.png')).toBe(false);
  });
});


