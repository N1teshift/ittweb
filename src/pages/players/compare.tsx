import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/getStaticProps';
import { PlayerComparison } from '@/features/modules/players/components/PlayerComparison';
import { ErrorBoundary } from '@/features/infrastructure/components';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function ComparePlayers() {
  return (
    <ErrorBoundary>
      <PlayerComparison pageNamespaces={pageNamespaces} />
    </ErrorBoundary>
  );
}





