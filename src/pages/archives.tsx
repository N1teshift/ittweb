import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/getStaticProps';
import { ArchivesPage } from '@/features/modules/archives/components';
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
