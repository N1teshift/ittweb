import React from 'react';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import { Logger } from '@/features/infrastructure/logging';
import TerrainVisualizerContainer from '@/features/modules/map-analyzer/components/TerrainVisualizerContainer';

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
    <div className="min-h-[calc(100vh-8rem)] px-4 md:px-8 py-8 md:py-10">
      <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6 text-center">Map Analyzer</h1>
      <div className="max-w-5xl mx-auto">
        <TerrainVisualizerContainer />
      </div>
    </div>
  );
}


