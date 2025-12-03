import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import Head from 'next/head';
import { PageHero } from '@/features/infrastructure/components';
import NewPostForm from '@/features/modules/content/blog/components/NewPostForm';
import { ErrorBoundary } from '@/features/infrastructure/components';

type NewPostPageProps = {
  isAuthenticated: boolean;
};

export default function NewPostPage({ isAuthenticated }: NewPostPageProps) {
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <>
          <Head>
            <title>Add New Post | Island Troll Tribes</title>
          </Head>
          <div className="min-h-[calc(100vh-8rem)]">
            <PageHero
              title="Add New Post"
              description="Publish news or development updates directly to the homepage feed."
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-6 backdrop-blur">
                <p className="text-red-200">
                  You must be logged in to create a post.
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
          <title>Add New Post | Island Troll Tribes</title>
        </Head>
        <div className="min-h-[calc(100vh-8rem)]">
          <PageHero
            title="Add New Post"
            description="Publish news or development updates directly to the homepage feed."
          />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <NewPostForm />
          </div>
        </div>
      </>
    </ErrorBoundary>
  );
}

export const getServerSideProps: GetServerSideProps<NewPostPageProps> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  return {
    props: {
      isAuthenticated: !!session?.user,
    },
  };
};



