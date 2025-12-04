import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewPostForm from '../NewPostForm';

// Mock the useNewPostForm hook
jest.mock('../../hooks/useNewPostForm', () => ({
  useNewPostForm: jest.fn(),
}));

// Mock the Button component
jest.mock('@/features/infrastructure/components', () => ({
  Button: ({ children, type, variant, onClick, disabled, className }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

const mockUseNewPostForm = require('../../hooks/useNewPostForm').useNewPostForm;

describe('NewPostForm', () => {
  const mockFormState = {
    title: '',
    slug: '',
    date: '',
    excerpt: '',
    content: '',
    published: false,
  };

  const defaultMockReturn = {
    status: 'authenticated',
    formState: mockFormState,
    isSubmitting: false,
    errorMessage: null,
    successMessage: null,
    canSubmit: false,
    handleFieldChange: jest.fn(),
    handleSubmit: jest.fn(),
    handleReset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNewPostForm.mockReturnValue(defaultMockReturn);
  });

  it('renders the form with all required fields', () => {
    render(<NewPostForm />);

    // Check for main form elements
    expect(document.querySelector('form')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Excerpt (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Publish immediately')).toBeInTheDocument();
  });

  it('renders form fields with correct initial values', () => {
    const filledFormState = {
      ...mockFormState,
      title: 'Test Title',
      slug: 'test-slug',
      date: '2025-01-01',
      excerpt: 'Test excerpt',
      content: 'Test content',
      published: true,
    };

    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      formState: filledFormState,
    });

    render(<NewPostForm />);

    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-slug')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test excerpt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
    expect(screen.getByLabelText('Publish immediately')).toBeChecked();
  });

  it('shows unauthenticated message when status is unauthenticated', () => {
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      status: 'unauthenticated',
    });

    render(<NewPostForm />);

    expect(screen.getByText('Please sign in with Discord to create a post.')).toBeInTheDocument();
  });

  it('does not show unauthenticated message when authenticated', () => {
    render(<NewPostForm />);

    expect(screen.queryByText('Please sign in with Discord to create a post.')).not.toBeInTheDocument();
  });

  it('calls handleFieldChange when input values change', async () => {
    const user = userEvent.setup();
    const mockHandleFieldChange = jest.fn();
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      handleFieldChange: mockHandleFieldChange,
    });

    render(<NewPostForm />);

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'New Title');

    expect(mockHandleFieldChange).toHaveBeenCalled();
  });

  it('calls handleFieldChange when checkbox is toggled', async () => {
    const user = userEvent.setup();
    const mockHandleFieldChange = jest.fn();
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      handleFieldChange: mockHandleFieldChange,
    });

    render(<NewPostForm />);

    const checkbox = screen.getByLabelText('Publish immediately');
    await user.click(checkbox);

    expect(mockHandleFieldChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        name: 'published',
        type: 'checkbox',
      }),
    }));
    expect(mockHandleFieldChange).toHaveBeenCalledTimes(1);
  });

  it('calls handleSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const mockHandleSubmit = jest.fn((e) => e.preventDefault());
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      handleSubmit: mockHandleSubmit,
      canSubmit: true,
    });

    render(<NewPostForm />);

    const form = document.querySelector('form')!;
    fireEvent.submit(form);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('calls handleReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandleReset = jest.fn();
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      handleReset: mockHandleReset,
    });

    render(<NewPostForm />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(mockHandleReset).toHaveBeenCalled();
  });

  it('displays error message when errorMessage is present', () => {
    const errorMessage = 'Failed to create post';
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      errorMessage,
    });

    render(<NewPostForm />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays success message when successMessage is present', () => {
    const successMessage = 'Post created successfully';
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      successMessage,
    });

    render(<NewPostForm />);

    expect(screen.getByText(successMessage)).toBeInTheDocument();
  });

  it('shows loading state when isSubmitting is true', () => {
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      isSubmitting: true,
    });

    render(<NewPostForm />);

    expect(screen.getByRole('button', { name: 'Publishing...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('disables submit button when canSubmit is false', () => {
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      canSubmit: false,
    });

    render(<NewPostForm />);

    expect(screen.getByRole('button', { name: 'Publish Post' })).toBeDisabled();
  });

  it('disables submit button when status is loading', () => {
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      status: 'loading',
      canSubmit: true,
    });

    render(<NewPostForm />);

    expect(screen.getByRole('button', { name: 'Publish Post' })).toBeDisabled();
  });

  it('enables submit button when canSubmit is true and status is not loading', () => {
    mockUseNewPostForm.mockReturnValue({
      ...defaultMockReturn,
      canSubmit: true,
      status: 'authenticated',
    });

    render(<NewPostForm />);

    expect(screen.getByRole('button', { name: 'Publish Post' })).not.toBeDisabled();
  });

  it('renders with correct CSS classes and structure', () => {
    const { container } = render(<NewPostForm />);

    // Check for key styling classes
    expect(container.querySelector('.space-y-6')).toBeInTheDocument();
    expect(container.querySelector('.border-amber-500\\/30')).toBeInTheDocument();
    expect(container.querySelector('.bg-black\\/30')).toBeInTheDocument();
    expect(container.querySelector('.backdrop-blur')).toBeInTheDocument();
  });

  it('has proper form structure with required fields', () => {
    render(<NewPostForm />);

    const titleInput = screen.getByLabelText('Title');
    const slugInput = screen.getByLabelText('Slug');
    const dateInput = screen.getByLabelText('Date');
    const contentTextarea = screen.getByLabelText('Content');

    expect(titleInput).toHaveAttribute('required');
    expect(slugInput).toHaveAttribute('required');
    expect(dateInput).toHaveAttribute('required');
    expect(contentTextarea).toHaveAttribute('required');

    const excerptInput = screen.getByLabelText('Excerpt (optional)');
    expect(excerptInput).not.toHaveAttribute('required');
  });
});

