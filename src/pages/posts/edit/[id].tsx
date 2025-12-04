import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import Head from 'next/head';
import { PageHero } from '@/features/infrastructure/components';
import { getPostById } from '@/features/modules/content/blog/lib/postService';
import { isAdmin } from '@/features/modules/community/users';
import EditPostForm from '@/features/modules/content/blog/components/EditPostForm';
import type { PostFormState } from '@/features/modules/content/blog/hooks/useNewPostForm';
import { ErrorBoundary } from '@/features/infrastructure/components';

type EditPostPageProps = {
  postId: string;
  initialPost: PostFormState | null;
  canEdit: boolean;
};

export default function EditPostPage({ postId, initialPost, canEdit }: EditPostPageProps) {
  if (!canEdit) {
    return (
      <ErrorBoundary>
        <>
          <Head>
            <title>Edit Post | Island Troll Tribes</title>
          </Head>
          <div className="min-h-[calc(100vh-8rem)]">
            <PageHero
              title="Edit Post"
              description="Update an existing post"
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-6 backdrop-blur">
                <p className="text-red-200">
                  You do not have permission to edit this post.
                </p>
              </div>
            </div>
          </div>
        </>
      </ErrorBoundary>
    );
  }

  if (!initialPost) {
    return (
      <ErrorBoundary>
        <>
          <Head>
            <title>Edit Post | Island Troll Tribes</title>
          </Head>
          <div className="min-h-[calc(100vh-8rem)]">
            <PageHero
              title="Edit Post"
              description="Update an existing post"
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="rounded-xl border border-amber-500/30 bg-black/30 p-6 backdrop-blur">
                <p className="text-gray-200">
                  Post not found.
                </p>
              </div>
            </div>
          </div>
        </>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <Head>
          <title>Edit Post: {initialPost.title} | Island Troll Tribes</title>
        </Head>
        <div className="min-h-[calc(100vh-8rem)]">
          <PageHero
            title="Edit Post"
            description="Update an existing post"
          />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <EditPostForm postId={postId} initialPost={initialPost} />
          </div>
        </div>
      </>
    </ErrorBoundary>
  );
}

export const getServerSideProps: GetServerSideProps<EditPostPageProps> = async (context) => {
  const postId = String(context.params?.id || '');

  try {
    const post = await getPostById(postId);

    if (!post) {
      return {
        props: {
          postId,
          initialPost: null,
          canEdit: false,
        },
      };
    }

    // Check permissions
    const session = await getServerSession(context.req, context.res, authOptions);
    let canEdit = false;

    if (session && session.discordId) {
      try {
        const { getUserDataByDiscordIdServer } = await import('@/features/modules/community/users/services/userDataService.server');
        const userData = await getUserDataByDiscordIdServer(session.discordId);
        const userIsAdmin = isAdmin(userData?.role);
        const userIsAuthor = post.createdByDiscordId === session.discordId;

        canEdit = userIsAdmin || userIsAuthor;
      } catch (error) {
        const { logError } = await import('@/features/infrastructure/logging');
        logError(error as Error, 'Failed to check permissions', {
          component: 'posts/edit/[id]',
          operation: 'getServerSideProps',
          postId,
        });
      }
    }

    return {
      props: {
        postId,
        initialPost: {
          title: post.title,
          slug: post.slug,
          date: post.date.split('T')[0],
          excerpt: post.excerpt ?? '',
          content: post.content,
          published: post.published,
        } as PostFormState,
        canEdit,
      },
    };
  } catch (error) {
    const { logError } = await import('@/features/infrastructure/logging');
    logError(error as Error, 'Failed to load post', {
      component: 'posts/edit/[id]',
      operation: 'getServerSideProps',
      postId,
    });
    return {
      props: {
        postId,
        initialPost: null,
        canEdit: false,
      },
    };
  }
};

