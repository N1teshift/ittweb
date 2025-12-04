import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { Logger } from '@/features/infrastructure/logging';
import { LoadingScreen, ErrorBoundary } from '@/features/infrastructure/components';

// Lazy load TerrainVisualizerContainer to reduce initial bundle size
// This component uses w3gjs which is ~200KB
const TerrainVisualizerContainer = dynamic(
  () => import('@/features/modules/tools-group/map-analyzer/components/TerrainVisualizerContainer'),
  {
    loading: () => <LoadingScreen message="Loading map analyzer..." />,
    ssr: false, // Map analyzer requires client-side only
  }
);

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function MapAnalyzer() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      Logger.info('Map Analyzer page visited', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)] px-4 md:px-8 py-8 md:py-10">
        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-6 text-center">Map Analyzer</h1>
        <div className="max-w-5xl mx-auto">
          <Suspense fallback={<LoadingScreen message="Loading map analyzer..." />}>
            <TerrainVisualizerContainer />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  );
}



