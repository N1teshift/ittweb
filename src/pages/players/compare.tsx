import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { PlayerComparison } from '@/features/modules/community/players/components/PlayerComparison';
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






