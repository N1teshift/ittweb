import { MetaPage } from '@/features/modules/analytics-group/meta/components/MetaPage';
import { ErrorBoundary } from '@/features/infrastructure/components';

const pageNamespaces = ["common"];

export default function Meta() {
  return (
    <ErrorBoundary>
      <MetaPage pageNamespaces={pageNamespaces} />
    </ErrorBoundary>
  );
}

