import Head from 'next/head';
import PageHero from '@/features/shared/components/PageHero';
import NewPostForm from '@/features/ittweb/blog/components/NewPostForm';

export default function NewPostPage() {
  return (
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
  );
}


