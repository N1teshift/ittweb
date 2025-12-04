import { ClassesPage } from '@/features/modules/content/classes/components/ClassesPage';
import { ErrorBoundary } from '@/features/infrastructure/components';

const pageNamespaces = ["common"];

export default function Classes() {
  return (
    <ErrorBoundary>
      <ClassesPage pageNamespaces={pageNamespaces} />
    </ErrorBoundary>
  );
}








