'use client';

import { useState, useMemo } from 'react';
import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { Section, ErrorBoundary } from '@/features/infrastructure/components';
import { ITTIconCategory } from '@/features/modules/content/guides/utils/iconUtils';
import { useIconMapperData } from '@/features/modules/tools-group/tools/hooks/useIconMapperData';
import { exportMappingsAsCode, exportMappingsAndDeletions } from '@/features/modules/tools-group/tools/utils/icon-mapper.utils';
import IconItem from '@/features/modules/tools-group/tools/components/IconItem';
import EntityProgressStats from '@/features/modules/tools-group/tools/components/EntityProgressStats';
import IconMapperMappingsList from '@/features/modules/tools-group/tools/components/IconMapperMappingsList';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

const allCategories = ['all', 'abilities', 'items', 'buildings', 'trolls', 'unclassified', 'base', 'wowpedia'] as const;

export default function IconMapper() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMappedOnly, setShowMappedOnly] = useState(false);

  const {
    mappings,
    icons,
    isLoading,
    itemsLoading,
    entityStats,
    markedForDeletion,
    updateMapping,
    removeMapping,
    getAllMappingsForIcon,
    toggleMarkForDeletion,
    isMarkedForDeletion,
    gameNameOptions,
  } = useIconMapperData();

  // Filter icons by category and search
  const filteredIcons = useMemo(() => {
    let filtered = selectedCategory === 'all'
      ? icons
      : icons.filter(icon => icon.category === selectedCategory);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(icon => {
        const filenameMatch = icon.filename.toLowerCase().includes(query);
        const subdirMatch = icon.subdirectory?.toLowerCase().includes(query);
        const mappingsMatch = getAllMappingsForIcon(icon.filename).some(
          m => m.gameName.toLowerCase().includes(query) || m.category.toLowerCase().includes(query)
        );
        return filenameMatch || subdirMatch || mappingsMatch;
      });
    }

    if (showMappedOnly) {
      filtered = filtered.filter(icon => 
        getAllMappingsForIcon(icon.filename).length > 0
      );
    }

    return filtered;
  }, [icons, selectedCategory, searchQuery, showMappedOnly, getAllMappingsForIcon]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportMappingsAsCode(mappings));
    alert('Mappings copied to clipboard!');
  };

  const copyMappingsAndDeletions = () => {
    const exportData = exportMappingsAndDeletions(mappings, markedForDeletion);
    navigator.clipboard.writeText(exportData);
    alert(`Mappings and deletion list copied to clipboard!\n\nMarked for deletion: ${markedForDeletion.size} icons`);
  };

  const currentCategoryMappings = selectedCategory !== 'all' && selectedCategory in mappings
    ? mappings[selectedCategory as ITTIconCategory]
    : {};

  const currentMappedCount = selectedCategory !== 'all' && selectedCategory in mappings
    ? Object.keys(currentCategoryMappings).length
    : 0;

  return (
    <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-6">Icon Mapper</h1>
      <p className="text-gray-300 mb-8">
        Map icon filenames to their game names. Enter the name as it appears in the game next to each icon.
      </p>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-gray-300 mr-2">Filter by category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-black/30 border border-amber-500/30 rounded-lg text-white"
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search icons (e.g. 'bloodlust')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-black/30 border border-amber-500/30 rounded-lg text-white placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={showMappedOnly}
              onChange={(e) => setShowMappedOnly(e.target.checked)}
              className="mr-2"
            />
            Show mapped only
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium"
          >
            Export Mappings to Clipboard
          </button>
          <button
            onClick={copyMappingsAndDeletions}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              markedForDeletion.size > 0
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white opacity-50 cursor-not-allowed'
            }`}
            disabled={markedForDeletion.size === 0}
            title={markedForDeletion.size > 0 ? `Export mappings and ${markedForDeletion.size} marked icons for deletion` : 'No icons marked for deletion'}
          >
            Export Mappings + Deletions ({markedForDeletion.size})
          </button>
        </div>
      </div>

      {/* Entity Mapping Progress */}
      <EntityProgressStats stats={entityStats} />

      {/* Current Category Stats */}
      <div className="mb-6 text-sm text-gray-400">
        Viewing: <span className="text-amber-400 capitalize">{selectedCategory}</span> |{' '}
        {selectedCategory !== 'all' && selectedCategory in mappings && (
          <>
            Mapped: <span className="text-amber-400">{currentMappedCount}</span> |{' '}
          </>
        )}
        Icons in view: <span className="text-gray-300">{filteredIcons.length}</span>
      </div>

      {/* Icon Grid */}
      <Section variant="medieval">
        {isLoading || itemsLoading ? (
          <p className="text-gray-400 text-center py-8">Loading icons...</p>
        ) : filteredIcons.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No icons found matching your filters.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredIcons.map((icon) => {
              const allMappingsForIcon = getAllMappingsForIcon(icon.filename);
              return (
                <IconItem
                  key={icon.path}
                  icon={icon}
                  allMappingsForIcon={allMappingsForIcon}
                  onUpdate={(category, filename, gameName) => {
                    updateMapping(category, filename, gameName);
                  }}
                  onRemove={(category, gameName) => {
                    removeMapping(category, gameName);
                  }}
                  allMappings={mappings}
                  isMarkedForDeletion={isMarkedForDeletion(icon.path)}
                  onToggleMarkForDeletion={toggleMarkForDeletion}
                  gameNameOptions={gameNameOptions}
                />
              );
            })}
          </div>
        )}
      </Section>

      {/* Current Mappings Display */}
      <IconMapperMappingsList 
        selectedCategory={selectedCategory}
        mappings={mappings}
        onRemove={removeMapping}
      />

      {/* Export Code Preview */}
      <div className="mt-8">
        <h2 className="font-medieval-brand text-2xl mb-4">Export Code</h2>
        <Section variant="medieval">
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{exportMappingsAsCode(mappings)}</code>
          </pre>
        </Section>
      </div>

      {/* Marked for Deletion Summary */}
      {markedForDeletion.size > 0 && (
        <div className="mt-8">
          <h2 className="font-medieval-brand text-2xl mb-4">
            Icons Marked for Deletion ({markedForDeletion.size})
          </h2>
          <div className="bg-black/30 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Array.from(markedForDeletion).sort().map((path) => {
                const icon = icons.find(i => i.path === path);
                return (
                  <div key={path} className="text-xs text-gray-400 truncate" title={path}>
                    {icon ? `${icon.category}/${icon.filename}` : path}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}

