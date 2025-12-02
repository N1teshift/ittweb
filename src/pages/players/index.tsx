import { PlayersPage } from '@/features/modules/community/players/components/PlayersPage';
import { ErrorBoundary } from '@/features/infrastructure/components';

const pageNamespaces = ["common"];

export default function Players() {
  return (
    <ErrorBoundary>
      <PlayersPage pageNamespaces={pageNamespaces} />
    </ErrorBoundary>
  );
}







