import { FormEvent, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { createComponentLogger } from '@/features/infrastructure/logging';
import type { PostFormState } from './useNewPostForm';

const logger = createComponentLogger('useEditPostForm');

export function useEditPostForm(postId: string, initialPost: PostFormState | null) {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [formState, setFormState] = useState<PostFormState>(
    initialPost || {
      title: '',
      slug: '',
      date: new Date().toISOString().slice(0, 10),
      excerpt: '',
      content: '',
      published: true,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!initialPost);

  // Load post if not provided
  useEffect(() => {
    if (!initialPost && postId) {
      setIsLoading(true);
      fetch(`/api/posts/${postId}`)
        .then((res) => res.json())
        .then((post) => {
          if (post && !post.error) {
            setFormState({
              title: post.title || '',
              slug: post.slug || '',
              date: post.date ? post.date.split('T')[0] : new Date().toISOString().slice(0, 10),
              excerpt: post.excerpt || '',
              content: post.content || '',
              published: post.published ?? true,
            });
          } else {
            setErrorMessage('Failed to load post');
          }
        })
        .catch((error) => {
          logger.error('Failed to load post', error, { postId });
          setErrorMessage('Failed to load post');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [postId, initialPost]);

  const canSubmit = useMemo(() => {
    return (
      formState.title.trim() &&
      formState.slug.trim() &&
      formState.content.trim() &&
      !isSubmitting &&
      !isLoading
    );
  }, [formState.content, formState.slug, formState.title, isSubmitting, isLoading]);

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const type = 'type' in target ? target.type : undefined;
    const checked = 'checked' in target ? target.checked : undefined;
    
    setFormState((prev) => {
      const nextValue = type === 'checkbox' ? checked : value;
      return {
        ...prev,
        [name]: nextValue,
      } as PostFormState;
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
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
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
            ? 'You must be signed in to edit posts.'
            : response.status === 403
            ? 'You do not have permission to edit this post.'
            : 'Failed to update post.');
        throw new Error(message);
      }

      setSuccessMessage('Post updated successfully. Redirecting...');
      logger.info('Post updated via UI', { postId, slug: formState.slug });
      
      // Revalidate the homepage to ensure fresh data (in case title/excerpt changed)
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '/' }),
        });
      } catch (revalidateError) {
        // Log but don't fail the update if revalidation fails
        logger.error('Failed to revalidate homepage', revalidateError instanceof Error ? revalidateError : new Error(String(revalidateError)), { postId, slug: formState.slug });
      }
      
      setTimeout(() => {
        router.push(`/posts/${formState.slug}`).catch(() => undefined);
      }, 1200);
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to update post', err, { postId, slug: formState.slug });
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    status,
    formState,
    isSubmitting,
    isLoading,
    errorMessage,
    successMessage,
    canSubmit,
    handleFieldChange,
    handleSubmit,
  };
}


