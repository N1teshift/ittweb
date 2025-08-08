import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import logger from '@/features/shared/utils/loggerUtils';
import Layout from '@/features/shared/components/Layout';
import { useFallbackTranslation } from '@/features/shared/hooks/useFallbackTranslation';
import { useState, useEffect, useCallback } from 'react';
import { getArchiveEntries, sortArchiveEntries } from '@/lib/archiveService';
import { ArchiveEntry as ArchiveEntryType } from '@/types/archive';
import { ArchiveEntry, ArchiveForm, ArchiveEditForm } from '@/features/archives/components';
import SortToggle from '@/features/archives/components/sections/SortToggle';
import TimelineSection from '@/features/archives/components/sections/TimelineSection';
import ImageModal from '@/features/archives/components/sections/ImageModal';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

export default function Archives() {
  const { t } = useFallbackTranslation(pageNamespaces);
  const [entries, setEntries] = useState<ArchiveEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ArchiveEntryType | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedEntries = await getArchiveEntries();
      const sortedEntries = sortArchiveEntries(fetchedEntries, sortOrder);
      setEntries(sortedEntries);
    } catch (err) {
      console.error('Failed to load archive entries:', err);
      setError('Failed to load archives. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleAddSuccess = () => {
    setShowForm(false);
    loadEntries(); // Reload entries after adding new one
  };

  const handleAddCancel = () => {
    setShowForm(false);
  };

  const handleEdit = (entry: ArchiveEntryType) => {
    setEditingEntry(entry);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingEntry(null);
    loadEntries(); // Reload entries after editing
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingEntry(null);
  };

  const handleImageClick = (url: string, title: string) => {
    setModalImage({ url, title });
    setShowImageModal(true);
  };

  const handleImageModalClose = () => {
    setShowImageModal(false);
    setModalImage(null);
  };

  if (typeof window !== 'undefined') {
    logger.info('Archives page visited', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  const datedEntries = entries.filter(entry => entry.dateInfo.type !== 'undated');
  const undatedEntries = entries.filter(entry => entry.dateInfo.type === 'undated');

  const handleSortOrderChange = (newOrder: 'newest' | 'oldest') => {
    setSortOrder(newOrder);
    const sortedEntries = sortArchiveEntries(entries, newOrder);
    setEntries(sortedEntries);
  };

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="text-center py-12 px-6">
          <h1 className="font-medieval-brand text-5xl md:text-6xl mb-8">
            Archives
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Welcome to the Island Troll Tribes Archives! 
            Explore the history and legacy of our game development, 
            and contribute your own memories to this living timeline.
          </p>
          
                     {/* Add Entry Button */}
           <button
             onClick={() => setShowForm(true)}
             className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg border border-amber-500 font-medium transition-colors mb-8"
           >
             Become an Archivist
           </button>

            {/* Sort Order Toggle */}
            {entries.length > 0 && (
              <SortToggle sortOrder={sortOrder} onChange={handleSortOrderChange} />
            )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto px-6 mb-8">
            <div className="bg-red-900/50 border border-red-500 rounded p-4 text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading archives...</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {!loading && (
          <div className="max-w-4xl mx-auto px-6">
            <TimelineSection 
              title="Timeline"
              entries={datedEntries}
              onEdit={handleEdit}
              onImageClick={handleImageClick}
            />

            <TimelineSection 
              title="Undated Archives"
              titleClassName="text-gray-400"
              entries={undatedEntries}
              onEdit={handleEdit}
              onImageClick={handleImageClick}
            />

            {/* Empty State */}
            {entries.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8">
                  <h3 className="font-medieval-brand text-2xl mb-4 text-amber-400">
                    No Archives Yet
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Be the first to contribute to our archives! 
                    Share your memories, screenshots, or videos from your Island Troll Tribes experience.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded border border-amber-500 transition-colors"
                  >
                    Add First Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

             {/* Archive Form Modal */}
       {showForm && (
         <ArchiveForm
           onSuccess={handleAddSuccess}
           onCancel={handleAddCancel}
         />
       )}

       {/* Archive Edit Form Modal */}
       {showEditForm && editingEntry && (
         <ArchiveEditForm
           entry={editingEntry}
           onSuccess={handleEditSuccess}
           onCancel={handleEditCancel}
         />
       )}

        <ImageModal isOpen={showImageModal} image={modalImage} onClose={handleImageModalClose} />
    </Layout>
  );
}
