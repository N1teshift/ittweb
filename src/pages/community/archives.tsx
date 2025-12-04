import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ArchivesPage } from '@/features/modules/community/archives/shared/components';
import { ErrorBoundary } from '@/features/infrastructure/components';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Archives() {
  return (
    <ErrorBoundary>
      <ArchivesPage pageNamespaces={pageNamespaces} />
    </ErrorBoundary>
  );
}

