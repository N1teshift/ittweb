import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import BlogPost from '@/features/modules/content/blog/components/BlogPost';
import PostDeleteDialog from '@/features/modules/content/blog/components/PostDeleteDialog';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/features/infrastructure/components';
import { ErrorBoundary } from '@/features/infrastructure/components';

const pageNamespaces = ["common"];

type PostPageProps = {
  title: string;
  date: string;
  author?: string;
  postId?: string;
  content: MDXRemoteSerializeResult;
  canEdit: boolean;
  canDelete: boolean;
};

export default function PostPage({ title, date, author, postId, content, canEdit, canDelete }: PostPageProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!postId) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Revalidate the homepage to ensure fresh data
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: '/' }),
          });
          // Force a full page reload to fetch the revalidated page
          window.location.href = '/';
        } catch (revalidateError) {
          // Log but don't fail the deletion if revalidation fails
          console.error('Failed to revalidate homepage:', revalidateError);
          // Still navigate even if revalidation fails
          router.push('/');
        }
      } else {
        const error = await response.json();
        setDeleteError(error.error || 'Failed to delete post');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setDeleteError('Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Extract just YYYY-MM-DD from ISO string
      return dateString.split('T')[0];
    } catch {
      return dateString;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-full px-6 py-12 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center link-amber"
            >
              ← Back to Home
            </Link>

            {(canEdit || canDelete) && (
              <div className="flex items-center gap-3">
                {canEdit && (
                  <Button
                    onClick={() => router.push(`/posts/edit/${postId}`)}
                    className="text-sm"
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="text-sm bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
          <BlogPost title={title} date={formatDate(date)} author={author}>
            <MDXRemote {...content} />
          </BlogPost>
        </div>

        <PostDeleteDialog
          isOpen={showDeleteDialog}
          postTitle={title}
          isLoading={isDeleting}
          error={deleteError}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      </div>
    </ErrorBoundary>
  );
}

export const getServerSideProps: GetServerSideProps<PostPageProps> = async (context) => {
  const slug = String(context.params?.slug || '');
  const withI18n = getStaticPropsWithTranslations(pageNamespaces);
  const i18nResult = await withI18n({ locale: context.locale as string });
  const { loadPostBySlug } = await import('@/features/modules/content/blog/lib/posts');

  try {
    const post = await loadPostBySlug(slug);

    if (!post) {
      return {
        notFound: true,
      };
    }

    // Check permissions
    const session = await getServerSession(context.req, context.res, authOptions);
    let canEdit = false;
    let canDelete = false;

    if (session && session.discordId) {
      try {
        const { getUserDataByDiscordIdServer } = await import('@/features/modules/community/users/services/userDataService.server');
        const { isAdmin } = await import('@/features/modules/community/users');
        const userData = await getUserDataByDiscordIdServer(session.discordId);
        const userIsAdmin = isAdmin(userData?.role);
        const userIsAuthor = post.meta.createdByDiscordId === session.discordId;

        canEdit = userIsAdmin || userIsAuthor;
        canDelete = userIsAdmin || userIsAuthor;
      } catch (error) {
        console.error('Failed to check permissions:', error);
      }
    }

    const mdxSource = await serialize(post.content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
        format: 'mdx',
      },
      parseFrontmatter: false,
    });

    return {
      props: {
        ...(i18nResult.props || {}),
        translationNamespaces: pageNamespaces,
        title: post.meta.title,
        date: post.meta.date,
        author: post.meta.creatorName,
        postId: post.meta.id,
        content: mdxSource,
        canEdit,
        canDelete,
      },
    };
  } catch (error) {
    console.error('Failed to load post:', error);
    return {
      notFound: true,
    };
  }
};

