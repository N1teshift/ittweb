import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import { PlayersPage } from '@/features/ittweb/players/components/PlayersPage';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Players() {
  return <PlayersPage pageNamespaces={pageNamespaces} />;
}

