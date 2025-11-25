'use client';

import { useState, useMemo } from 'react';
import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import { ITTIconCategory } from '@/features/ittweb/guides/utils/iconUtils';
import { useIconMapperData } from '@/features/ittweb/tools/useIconMapperData';
import { exportMappingsAsCode } from '@/features/ittweb/tools/icon-mapper.utils';
import IconItem from '@/features/ittweb/tools/components/IconItem';
import IconMapperStats from '@/features/ittweb/tools/components/IconMapperStats';
import IconMapperMappingsList from '@/features/ittweb/tools/components/IconMapperMappingsList';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

const allCategories = ['all', 'abilities', 'items', 'buildings', 'trolls', 'unclassified', 'base'] as const;

export default function IconMapper() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMappedOnly, setShowMappedOnly] = useState(false);

  const {
    mappings,
    icons,
    isLoading,
    stats,
    updateMapping,
    removeMapping,
    getExistingMapping,
  } = useIconMapperData();

  // Filter icons by category and search
  const filteredIcons = useMemo(() => {
    let filtered = selectedCategory === 'all'
      ? icons
      : icons.filter(icon => icon.category === selectedCategory);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(icon => 
        icon.filename.toLowerCase().includes(query) ||
        icon.subdirectory?.toLowerCase().includes(query) ||
        getExistingMapping(icon.category as ITTIconCategory, icon.filename)?.toLowerCase().includes(query)
      );
    }

    if (showMappedOnly) {
      filtered = filtered.filter(icon => 
        getExistingMapping(icon.category as ITTIconCategory, icon.filename) !== undefined
      );
    }

    return filtered;
  }, [icons, selectedCategory, searchQuery, showMappedOnly, getExistingMapping]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportMappingsAsCode(mappings));
    alert('Mappings copied to clipboard!');
  };

  const currentCategoryMappings = selectedCategory !== 'all' && selectedCategory in mappings
    ? mappings[selectedCategory as ITTIconCategory]
    : {};

  const overallStat = useMemo(() => {
    if (stats.length === 0) return null;
    const aggregate = stats.reduce(
      (acc, stat) => {
        acc.total += stat.total;
        acc.mapped += stat.mapped;
        acc.unmapped += stat.unmapped;
        return acc;
      },
      { total: 0, mapped: 0, unmapped: 0 }
    );
    return {
      category: 'all',
      total: aggregate.total,
      mapped: aggregate.mapped,
      unmapped: aggregate.unmapped,
      percentage: aggregate.total > 0 ? Math.round((aggregate.mapped / aggregate.total) * 100) : 0,
    };
  }, [stats]);

  const currentStat = selectedCategory === 'all'
    ? overallStat
    : stats.find(s => s.category === selectedCategory);

  const currentMappedCount = selectedCategory === 'all'
    ? currentStat?.mapped ?? 0
    : Object.keys(currentCategoryMappings).length;

  return (
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
      <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6">Icon Mapper</h1>
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
        </div>
      </div>

      {/* Stats Overview */}
      <IconMapperStats stats={stats} selectedCategory={selectedCategory} />

      {/* Current Category Stats */}
      <div className="mb-6 text-sm text-gray-400">
        Viewing: <span className="text-amber-400 capitalize">{selectedCategory}</span> |{' '}
        Mapped: <span className="text-amber-400">{currentMappedCount}</span> |{' '}
        Unmapped: <span className="text-red-400">{currentStat?.unmapped || 0}</span> |{' '}
        Icons in view: <span className="text-gray-300">{filteredIcons.length}</span>
      </div>

      {/* Icon Grid */}
      <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
        {isLoading ? (
          <p className="text-gray-400 text-center py-8">Loading icons...</p>
        ) : filteredIcons.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No icons found matching your filters.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredIcons.map((icon) => {
              const existingMapping = getExistingMapping(icon.category as ITTIconCategory, icon.filename);
              return (
                <IconItem
                  key={icon.path}
                  icon={icon}
                  existingMapping={existingMapping}
                  onUpdate={(filename, gameName) => {
                    if (icon.category in mappings) {
                      updateMapping(icon.category as ITTIconCategory, filename, gameName);
                    }
                  }}
                  onRemove={(gameName) => {
                    if (icon.category in mappings) {
                      removeMapping(icon.category as ITTIconCategory, gameName);
                    }
                  }}
                  allMappings={mappings}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Current Mappings Display */}
      <IconMapperMappingsList 
        selectedCategory={selectedCategory}
        mappings={mappings}
        onRemove={removeMapping}
      />

      {/* Export Code Preview */}
      <div className="mt-8">
        <h2 className="font-medieval-brand text-2xl mb-4">Export Code</h2>
        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{exportMappingsAsCode(mappings)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
