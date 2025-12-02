import { act, renderHook, waitFor } from '@testing-library/react';
import { useEditPostForm } from '../useEditPostForm';
import type { PostFormState } from '../useNewPostForm';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn().mockResolvedValue(undefined),
    query: {},
    pathname: '/',
  }),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

// Mock logger
jest.mock('@/features/infrastructure/logging', () => ({
  createComponentLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

const { useSession, signIn } = jest.requireMock('next-auth/react');

describe('useEditPostForm', () => {
  const mockPost: PostFormState = {
    title: 'Existing Post',
    slug: 'existing-post',
    date: '2024-01-15', // Fixed date for testing
    excerpt: 'Existing excerpt',
    content: 'Existing content',
    published: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'Test User' } },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initializes with post data', () => {
    it('should initialize with provided post data', () => {
      // Act
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );

      // Assert - formState should match the provided post data
      expect(result.current.formState.title).toBe(mockPost.title);
      expect(result.current.formState.slug).toBe(mockPost.slug);
      expect(result.current.formState.content).toBe(mockPost.content);
      expect(result.current.formState.excerpt).toBe(mockPost.excerpt);
      expect(result.current.formState.published).toBe(mockPost.published);
      expect(result.current.formState.date).toBe(mockPost.date);
      expect(result.current.isLoading).toBe(false);
    });

    it('should initialize with empty state when post is null', () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      // Act
      const { result } = renderHook(() => useEditPostForm('post-id', null));

      // Assert
      expect(result.current.formState.title).toBe('');
      expect(result.current.formState.slug).toBe('');
      // isLoading should be true when initialPost is null (will load from API)
      expect(result.current.isLoading).toBe(true);
    });

    it('should load post from API when not provided', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: 'Loaded Post',
          slug: 'loaded-post',
          date: '2024-01-20T00:00:00Z',
          excerpt: 'Loaded excerpt',
          content: 'Loaded content',
          published: true,
        }),
      } as Response);

      // Act
      const { result } = renderHook(() => useEditPostForm('post-id', null));

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
      expect(result.current.formState.title).toBe('Loaded Post');
      expect(result.current.formState.slug).toBe('loaded-post');
      expect(mockFetch).toHaveBeenCalledWith('/api/posts/post-id');
    });

    it('should handle API error when loading post', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useEditPostForm('post-id', null));

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
      expect(result.current.errorMessage).toBe('Failed to load post');
    });
  });

  describe('handles field updates', () => {
    it('should update title field', () => {
      // Arrange
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const event = {
        target: { name: 'title', value: 'Updated Title' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleFieldChange(event);
      });

      // Assert
      expect(result.current.formState.title).toBe('Updated Title');
    });

    it('should update content field', () => {
      // Arrange
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const event = {
        target: { name: 'content', value: 'Updated content' },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      // Act
      act(() => {
        result.current.handleFieldChange(event);
      });

      // Assert
      expect(result.current.formState.content).toBe('Updated content');
    });

    it('should update published checkbox', () => {
      // Arrange
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const event = {
        target: { name: 'published', type: 'checkbox', checked: false },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleFieldChange(event);
      });

      // Assert
      expect(result.current.formState.published).toBe(false);
    });

    it('should update canSubmit when required fields are filled', () => {
      // Arrange
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );

      // Assert - should be able to submit with existing data
      expect(result.current.canSubmit).toBe(true);
    });
  });

  describe('validates form', () => {
    it('should not allow submission with empty title', () => {
      // Arrange
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );

      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: '' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Assert
      expect(result.current.canSubmit).toBeFalsy();
    });

    it('should not allow submission with empty content', () => {
      // Arrange
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );

      act(() => {
        result.current.handleFieldChange({
          target: { name: 'content', value: '' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      // Assert
      expect(result.current.canSubmit).toBeFalsy();
    });

    it('should not allow submission while loading', async () => {
      // Arrange
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      // Don't resolve the fetch immediately to keep loading state
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      mockFetch.mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useEditPostForm('post-id', null));

      // Assert - should be loading initially when initialPost is null
      expect(result.current.isLoading).toBe(true);
      expect(result.current.canSubmit).toBeFalsy();

      // Clean up - resolve the fetch
      resolveFetch!({
        ok: true,
        json: async () => ({}),
      } as Response);
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 3000 });
    });

    it('should not allow submission while submitting', async () => {
      // Arrange
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Act
      act(() => {
        result.current.handleSubmit(event);
      });

      // Assert
      expect(result.current.isSubmitting).toBe(true);
      expect(result.current.canSubmit).toBeFalsy();
    });
  });

  describe('handles submission', () => {
    it('should redirect to sign in if not authenticated', () => {
      // Arrange
      const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
      (useSession as jest.Mock).mockReturnValue({
        status: 'unauthenticated',
        data: null,
      });
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Act
      act(() => {
        result.current.handleSubmit(event);
      });

      // Assert
      expect(mockSignIn).toHaveBeenCalledWith('discord');
    });

    it('should update post when authenticated', async () => {
      // Arrange
      (useSession as jest.Mock).mockReturnValue({
        status: 'authenticated',
        data: { user: { name: 'Test User' } },
      });
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/posts/post-id',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle submission errors', async () => {
      // Arrange
      (useSession as jest.Mock).mockReturnValue({
        status: 'authenticated',
        data: { user: { name: 'Test User' } },
      });
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Permission denied' }),
      } as Response);

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.errorMessage).toBe('Permission denied');
    });

    it('should handle 401 errors', async () => {
      // Arrange
      (useSession as jest.Mock).mockReturnValue({
        status: 'authenticated',
        data: { user: { name: 'Test User' } },
      });
      const { result } = renderHook(() =>
        useEditPostForm('post-id', mockPost)
      );
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({}),
      } as Response);

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.errorMessage).toBe(
        'You must be signed in to edit posts.'
      );
    });
  });
});


