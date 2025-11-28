import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import Head from 'next/head';
import PageHero from '@/features/infrastructure/components/PageHero';
import { getPostById } from '@/features/modules/blog/lib/postService';
import { getUserDataByDiscordId } from '@/features/infrastructure/lib/userDataService';
import { isAdmin } from '@/features/infrastructure/utils/userRoleUtils';
import EditPostForm from '@/features/modules/blog/components/EditPostForm';
import type { PostFormState } from '@/features/modules/blog/hooks/useNewPostForm';

type EditPostPageProps = {
  postId: string;
  initialPost: PostFormState | null;
  canEdit: boolean;
};

export default function EditPostPage({ postId, initialPost, canEdit }: EditPostPageProps) {
  if (!canEdit) {
    return (
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
    );
  }

  if (!initialPost) {
    return (
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
    );
  }

  return (
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
        const userData = await getUserDataByDiscordId(session.discordId);
        const userIsAdmin = isAdmin(userData?.role);
        const userIsAuthor = post.createdByDiscordId === session.discordId;
        
        canEdit = userIsAdmin || userIsAuthor;
      } catch (error) {
        console.error('Failed to check permissions:', error);
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
    console.error('Failed to load post:', error);
    return {
      props: {
        postId,
        initialPost: null,
        canEdit: false,
      },
    };
  }
};

