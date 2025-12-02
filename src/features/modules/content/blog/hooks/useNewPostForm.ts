import { FormEvent, useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { createComponentLogger } from '@/features/infrastructure/logging';

export type PostFormState = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  published: boolean;
};

const logger = createComponentLogger('useNewPostForm');

const initialState: PostFormState = {
  title: '',
  slug: '',
  date: new Date().toISOString().slice(0, 10),
  excerpt: '',
  content: '',
  published: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function useNewPostForm(onSuccess?: () => void) {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [formState, setFormState] = useState<PostFormState>(initialState);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      formState.title.trim() &&
      formState.slug.trim() &&
      formState.content.trim() &&
      !isSubmitting
    );
  }, [formState.content, formState.slug, formState.title, isSubmitting]);

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const type = 'type' in target ? target.type : undefined;
    const checked = 'checked' in target ? target.checked : undefined;
    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }

    setFormState((prev) => {
      const nextValue = type === 'checkbox' ? checked : value;
      const next = {
        ...prev,
        [name]: nextValue,
      } as PostFormState;

      if (name === 'title' && !slugManuallyEdited) {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isAuthenticated) {
      signIn('discord');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title.trim(),
          slug: formState.slug.trim(),
          date: new Date(formState.date).toISOString(),
          excerpt: formState.excerpt.trim() || undefined,
          content: formState.content.trim(),
          published: formState.published,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data?.error ||
          (response.status === 401
            ? 'You must be signed in to create posts.'
            : 'Failed to create post.');
        throw new Error(message);
      }

      setSuccessMessage('Post created successfully. Redirecting to home…');
      logger.info('Post created via UI', { slug: formState.slug });
      
      // Revalidate the homepage to ensure fresh data
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        // Log but don't fail the creation if revalidation fails
        logger.error('Failed to revalidate homepage', revalidateError instanceof Error ? revalidateError : new Error(String(revalidateError)), { slug: formState.slug });
      }

      // If onSuccess callback is provided, use it instead of redirecting
      if (onSuccess) {
        onSuccess();
      } else {
        // Force a full page reload to fetch the revalidated page
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to create post', err, { slug: formState.slug });
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormState(initialState);
    setSlugManuallyEdited(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return {
    status,
    formState,
    isSubmitting,
    errorMessage,
    successMessage,
    canSubmit,
    handleFieldChange,
    handleSubmit,
    handleReset,
  };
}



