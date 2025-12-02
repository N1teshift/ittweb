import { renderHook, waitFor } from '@testing-library/react';
import { useClassesData, useClassData } from '../useClassesData';

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock swrKeys
jest.mock('@/features/infrastructure/lib/swrConfig', () => ({
  swrKeys: {
    classes: jest.fn((className, options) => {
      if (className) {
        return `/api/classes/${className}${options?.category ? `?category=${options.category}` : ''}`;
      }
      return `/api/classes${options?.category ? `?category=${options.category}` : ''}`;
    }),
  },
}));

const mockUseSWR = require('swr').default;

describe('useClassesData', () => {
  const mockClassesData = [
    {
      name: 'Warrior',
      category: 'melee',
      totalGames: 150,
      wins: 90,
      losses: 60,
      winRate: 0.6,
    },
    {
      name: 'Mage',
      category: 'ranged',
      totalGames: 120,
      wins: 75,
      losses: 45,
      winRate: 0.625,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns classes data without category filter', async () => {
    mockUseSWR.mockReturnValue({
      data: mockClassesData,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassesData());

    await waitFor(() => {
      expect(result.current.classes).toEqual(mockClassesData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/classes',
      expect.any(Function),
      expect.objectContaining({
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 300000,
      })
    );
  });

  it('returns classes data with category filter', async () => {
    mockUseSWR.mockReturnValue({
      data: mockClassesData,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassesData('1v1'));

    await waitFor(() => {
      expect(result.current.classes).toEqual(mockClassesData);
    });

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/classes?category=1v1',
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('handles loading state', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassesData());

    expect(result.current.classes).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles error state', () => {
    const mockError = new Error('Failed to fetch classes');
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassesData());

    expect(result.current.classes).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('returns empty array when data is not an array', () => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassesData());

    expect(result.current.classes).toEqual([]);
  });
});

describe('useClassData', () => {
  const mockClassData = {
    name: 'Warrior',
    category: 'melee',
    totalGames: 150,
    wins: 90,
    losses: 60,
    winRate: 0.6,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns single class data', async () => {
    mockUseSWR.mockReturnValue({
      data: mockClassData,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassData('Warrior'));

    await waitFor(() => {
      expect(result.current.classData).toEqual(mockClassData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('returns single class data with category filter', async () => {
    mockUseSWR.mockReturnValue({
      data: mockClassData,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassData('Warrior', '1v1'));

    await waitFor(() => {
      expect(result.current.classData).toEqual(mockClassData);
    });

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/classes/Warrior?category=1v1',
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('returns null when data is an array', () => {
    mockUseSWR.mockReturnValue({
      data: [mockClassData],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassData('Warrior'));

    expect(result.current.classData).toBeNull();
  });

  it('skips fetch when className is not provided', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useClassData('', '1v1'));

    expect(result.current.classData).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });
});

