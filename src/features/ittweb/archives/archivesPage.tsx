import React, { useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import logger from '@/features/shared/utils/loggerUtils';
import { PageHero } from '@/features/shared/components';
import { 
  ArchiveEntry, 
  ArchiveForm, 
  ArchiveEditForm,
  ArchivesToolbar,
  ArchivesContent,
} from '@/features/ittweb/archives/components';
import ImageModal from '@/features/ittweb/archives/components/sections/ImageModal';
import { useArchivesPage, useArchivesActions } from '@/features/ittweb/archives/hooks';

interface ArchivesPageProps {
  pageNamespaces: string[];
}

const ArchivesPage: React.FC<ArchivesPageProps> = ({ pageNamespaces }) => {
  const { status } = useSession();
  
  // Use our custom hooks
  const {
    state: { entries, loading, error, showForm, showEditForm, editingEntry, showImageModal, modalImage, sortOrder },
    datedEntries,
    undatedEntries,
    setEntries,
    setLoading,
    setError,
    setShowForm,
    setShowEditForm,
    setEditingEntry,
    setShowImageModal,
    setModalImage,
    setSortOrder,
  } = useArchivesPage();

  const {
    loadEntries,
    handleAddSuccess,
    handleAddCancel,
    handleEdit,
    handleEditSuccess,
    handleEditCancel,
    handleImageClick,
    handleImageModalClose,
    handleSortOrderChange,
    handleSignIn,
  } = useArchivesActions({
    setEntries,
    setLoading,
    setError,
    setShowForm,
    setShowEditForm,
    setEditingEntry,
    setShowImageModal,
    setModalImage,
    setSortOrder,
    entries,
    sortOrder,
  });

  // Load entries on mount (only once)
  useEffect(() => {
    const loadEntriesOnce = async () => {
      try {
        logger.info('Loading archive entries - initial load');
        setLoading(true);
        setError(null);
        
        const fetchedEntries = await import('@/lib/archiveService').then(module => module.getArchiveEntries());
        
        setEntries(fetchedEntries);
        logger.info('Successfully loaded archive entries', { 
          count: fetchedEntries.length
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading entries');
        logger.error('Failed to load archive entries', { error: error.message });
        setError('Failed to load archives. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadEntriesOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - setters are stable

  // Log page visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      logger.info('Archives page visited', {
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAddClick = useCallback(() => {
    setShowForm(true);
  }, [setShowForm]);

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero
        title="Archives"
        description="Welcome to the Island Troll Tribes Archives! Explore the history and legacy of our game development, and contribute your own memories to this living timeline."
      />

      <ArchivesToolbar
        isAuthenticated={isAuthenticated}
        entriesCount={entries.length}
        sortOrder={sortOrder}
        onAddClick={handleAddClick}
        onSignInClick={handleSignIn}
        onSortOrderChange={handleSortOrderChange}
      />

      <ArchivesContent
        loading={loading}
        error={error}
        entries={entries}
        datedEntries={datedEntries}
        undatedEntries={undatedEntries}
        isAuthenticated={isAuthenticated}
        onEdit={handleEdit}
        onImageClick={handleImageClick}
        onAddClick={handleAddClick}
        onSignInClick={handleSignIn}
      />

      {isAuthenticated && showForm && (
        <ArchiveForm
          onSuccess={handleAddSuccess}
          onCancel={handleAddCancel}
        />
      )}

      {isAuthenticated && showEditForm && editingEntry && (
        <ArchiveEditForm
          entry={editingEntry}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}

      <ImageModal isOpen={showImageModal} image={modalImage} onClose={handleImageModalClose} />
    </div>
  );
};

export default ArchivesPage;
