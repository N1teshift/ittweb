import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import { Layout } from '@/features/shared/components';
import { ArchivesPage } from '@/features/ittweb/archives/components';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Archives() {

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <ArchivesPage pageNamespaces={pageNamespaces} />
    </Layout>
  );
}
