import { act, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNewPostForm } from '../useNewPostForm';

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

describe('useNewPostForm', () => {
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

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

  describe('initializes form state', () => {
    it('should initialize with default values', () => {
      // Act
      const { result } = renderHook(() => useNewPostForm());

      // Assert
      expect(result.current.formState.title).toBe('');
      expect(result.current.formState.slug).toBe('');
      expect(result.current.formState.date).toBeTruthy(); // Should be today's date
      expect(result.current.formState.excerpt).toBe('');
      expect(result.current.formState.content).toBe('');
      expect(result.current.formState.published).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.successMessage).toBeNull();
    });

    it('should initialize with canSubmit as false when fields are empty', () => {
      // Act
      const { result } = renderHook(() => useNewPostForm());

      // Assert
      expect(result.current.canSubmit).toBeFalsy();
    });
  });

  describe('handles field updates', () => {
    it('should update title field', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());
      const event = {
        target: { name: 'title', value: 'Test Post Title' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleFieldChange(event);
      });

      // Assert
      expect(result.current.formState.title).toBe('Test Post Title');
    });

    it('should auto-generate slug from title', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());
      const event = {
        target: { name: 'title', value: 'Test Post Title' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleFieldChange(event);
      });

      // Assert
      expect(result.current.formState.slug).toBe('test-post-title');
    });

    it('should not auto-generate slug if manually edited', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());
      
      // First, manually edit slug
      const slugEvent = {
        target: { name: 'slug', value: 'custom-slug' },
      } as React.ChangeEvent<HTMLInputElement>;
      
      act(() => {
        result.current.handleFieldChange(slugEvent);
      });

      // Then change title
      const titleEvent = {
        target: { name: 'title', value: 'New Title' },
      } as React.ChangeEvent<HTMLInputElement>;

      // Act
      act(() => {
        result.current.handleFieldChange(titleEvent);
      });

      // Assert
      expect(result.current.formState.slug).toBe('custom-slug'); // Should not change
    });

    it('should update content field', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());
      const event = {
        target: { name: 'content', value: 'Test content here' },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      // Act
      act(() => {
        result.current.handleFieldChange(event);
      });

      // Assert
      expect(result.current.formState.content).toBe('Test content here');
    });

    it('should update published checkbox', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());
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
      const { result } = renderHook(() => useNewPostForm());

      // Act
      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: 'Test Title' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      act(() => {
        result.current.handleFieldChange({
          target: { name: 'content', value: 'Test content' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      // Assert
      expect(result.current.canSubmit).toBe(true);
    });
  });

  describe('validates form', () => {
    it('should not allow submission with empty title', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());

      act(() => {
        result.current.handleFieldChange({
          target: { name: 'content', value: 'Test content' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      // Assert
      expect(result.current.canSubmit).toBeFalsy();
    });

    it('should not allow submission with empty content', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());

      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: 'Test Title' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      // Assert
      // Slug is auto-generated, but content is empty, so canSubmit should be false
      expect(result.current.canSubmit).toBeFalsy();
    });

    it('should not allow submission while submitting', async () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      // Fill form
      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: 'Test Title' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleFieldChange({
          target: { name: 'content', value: 'Test content' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

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
      (useSession as jest.Mock).mockReturnValue({
        status: 'unauthenticated',
        data: null,
      });
      const { result } = renderHook(() => useNewPostForm());
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

    it('should create post when authenticated', async () => {
      // Arrange
      (useSession as jest.Mock).mockReturnValue({
        status: 'authenticated',
        data: { user: { name: 'Test User' } },
      });
      const { result } = renderHook(() => useNewPostForm());
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      // Fill form
      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: 'Test Title' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleFieldChange({
          target: { name: 'content', value: 'Test content' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

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
        '/api/posts',
        expect.objectContaining({
          method: 'POST',
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
      const { result } = renderHook(() => useNewPostForm());
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as Response);

      // Fill form
      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: 'Test Title' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleFieldChange({
          target: { name: 'content', value: 'Test content' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => expect(result.current.isSubmitting).toBe(false));
      expect(result.current.errorMessage).toBe('Server error');
    });

    it('should call onSuccess callback if provided', async () => {
      // Arrange
      const onSuccess = jest.fn();
      (useSession as jest.Mock).mockReturnValue({
        status: 'authenticated',
        data: { user: { name: 'Test User' } },
      });
      const { result } = renderHook(() => useNewPostForm(onSuccess));
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      // Fill form
      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: 'Test Title' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleFieldChange({
          target: { name: 'content', value: 'Test content' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Act
      await act(async () => {
        await result.current.handleSubmit(event);
      });

      // Assert
      await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    });
  });

  describe('handles reset', () => {
    it('should reset form to initial state', () => {
      // Arrange
      const { result } = renderHook(() => useNewPostForm());

      // Fill form
      act(() => {
        result.current.handleFieldChange({
          target: { name: 'title', value: 'Test Title' },
        } as React.ChangeEvent<HTMLInputElement>);
        result.current.handleFieldChange({
          target: { name: 'content', value: 'Test content' },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      });

      // Act
      act(() => {
        result.current.handleReset();
      });

      // Assert
      expect(result.current.formState.title).toBe('');
      expect(result.current.formState.content).toBe('');
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.successMessage).toBeNull();
    });
  });
});


