import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';
import { useEffect } from 'react';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Download() {
  const { t } = useFallbackTranslation(pageNamespaces);

  // Auto-download when page loads
  useEffect(() => {
    const downloadUrl = 'https://github.com/Exactuz/island-troll-tribes/releases/download/v3.27/Island.Troll.Tribes.v3.27.4.w3x';
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'Island.Troll.Tribes.v3.27.4.w3x';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log the download attempt
    if (typeof window !== 'undefined') {
      logger.info('Download page visited and download triggered', {
        path: window.location.pathname,
        downloadUrl: downloadUrl,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  if (typeof window !== 'undefined') {
    logger.info('Download page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  const handleManualDownload = () => {
    const downloadUrl = 'https://github.com/Exactuz/island-troll-tribes/releases/download/v3.27/Island.Troll.Tribes.v3.27.4.w3x';
    window.open(downloadUrl, '_blank');
  };

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center max-w-2xl mx-auto px-6 py-12">
          {/* Main Heading */}
          <h1 className="font-medieval-brand text-5xl md:text-6xl mb-8">
            Download
          </h1>
          
          {/* Content Section */}
          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8 mb-8">
            <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed">
              Welcome to the Island Troll Tribes Download section!
              <br />
              Your download should start automatically. If it doesn&apos;t, click the button below.
            </p>
            
            {/* Download Information */}
            <div className="mt-6 space-y-4">
              <div className="text-left">
                <h2 className="font-medieval-brand text-2xl mb-4">Download Information</h2>
                <div className="text-gray-300 space-y-2">
                  <p><strong>File:</strong> Island.Troll.Tribes.v3.27.4.w3x</p>
                  <p><strong>Version:</strong> v3.27.4</p>
                  <p><strong>Size:</strong> ~14.4 MB</p>
                  <p><strong>Format:</strong> Warcraft III Map File</p>
                </div>
              </div>
              
              {/* Manual Download Button */}
              <div className="mt-8">
                <button 
                  onClick={handleManualDownload}
                  className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4V12L16.5 9.5C16.9 9.1 17.5 9.1 17.9 9.5C18.3 9.9 18.3 10.5 17.9 10.9L12.7 16.1C12.3 16.5 11.7 16.5 11.3 16.1L6.1 10.9C5.7 10.5 5.7 9.9 6.1 9.5C6.5 9.1 7.1 9.1 7.5 9.5L10 12V4C10 2.9 10.9 2 12 2ZM4 18V20H20V18C20 17.4 19.6 17 19 17H5C4.4 17 4 17.4 4 18Z"/>
                  </svg>
                  Download Map File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
