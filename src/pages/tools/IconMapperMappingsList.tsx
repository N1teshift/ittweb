import Image from 'next/image';
import { ITTIconCategory } from '@/features/ittweb/guides/utils/iconUtils';
import type { IconMapping } from './icon-mapper.types';

type IconMapperMappingsListProps = {
  selectedCategory: string;
  mappings: IconMapping;
  onRemove: (category: ITTIconCategory, gameName: string) => void;
};

export default function IconMapperMappingsList({ 
  selectedCategory, 
  mappings, 
  onRemove 
}: IconMapperMappingsListProps) {
  if (selectedCategory === 'all') {
    return (
      <div className="mt-8">
        <h2 className="font-medieval-brand text-2xl mb-4">Current Mappings</h2>
        <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
          <p className="text-gray-400">
            Select a specific category to review or edit its mappings.
          </p>
        </div>
      </div>
    );
  }

  const currentCategoryMappings = selectedCategory in mappings 
    ? mappings[selectedCategory as ITTIconCategory] 
    : {};

  return (
    <div className="mt-8">
      <h2 className="font-medieval-brand text-2xl mb-4">Current Mappings for {selectedCategory}</h2>
      <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-6">
        {Object.keys(currentCategoryMappings).length === 0 ? (
          <p className="text-gray-400">No mappings yet for this category.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(currentCategoryMappings).map(([gameName, filename]) => (
              <div key={gameName} className="flex items-center gap-4 p-2 hover:bg-black/20 rounded">
                <Image
                  src={`/icons/itt/${selectedCategory}/${filename}`}
                  alt={gameName}
                  width={32}
                  height={32}
                  className="border border-amber-500/30 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/itt/items/enabled/BTNYellowHerb.png';
                  }}
                />
                <span className="text-amber-400 font-medium">{gameName}</span>
                <span className="text-gray-400 text-sm">→</span>
                <span className="text-gray-300 text-sm">{filename}</span>
                <button
                  onClick={() => onRemove(selectedCategory as ITTIconCategory, gameName)}
                  className="ml-auto text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

