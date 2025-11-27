import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import { PlayerComparison } from '@/features/modules/players/components/PlayerComparison';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function ComparePlayers() {
  return <PlayerComparison pageNamespaces={pageNamespaces} />;
}



