import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/getStaticProps';
import { ArchivesPage } from '@/features/modules/archives/components';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Archives() {
  return <ArchivesPage pageNamespaces={pageNamespaces} />;
}
