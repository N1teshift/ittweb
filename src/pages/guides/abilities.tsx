import { getStaticPropsWithTranslations } from '@/features/shared/lib/getStaticProps';
import Layout from '@/features/shared/components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import { ABILITIES, ABILITY_CATEGORIES, AbilityCategory, AbilityData, getAbilitiesByCategory, searchAbilities } from '@/features/guides/data/abilities';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

interface AbilityCardProps {
  ability: AbilityData;
}

function AbilityCard({ ability }: AbilityCardProps) {
  return (
    <Link href={`/guides/abilities/${ability.id}`} className="block">
      <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4 hover:border-amber-400/50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medieval text-xl text-amber-400">{ability.name}</h3>
          {ability.classRequirement && (
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
              {ability.classRequirement}
            </span>
          )}
        </div>
        
        <p className="text-gray-300 text-sm mb-3">{ability.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
          {ability.manaCost !== undefined && (
            <div className="text-blue-300">
              <span className="text-gray-400">Mana:</span> {ability.manaCost}
            </div>
          )}
          {ability.cooldown !== undefined && (
            <div className="text-purple-300">
              <span className="text-gray-400">Cooldown:</span> {ability.cooldown}s
            </div>
          )}
          {ability.range !== undefined && (
            <div className="text-green-300">
              <span className="text-gray-400">Range:</span> {ability.range}
            </div>
          )}
          {ability.duration !== undefined && (
            <div className="text-orange-300">
              <span className="text-gray-400">Duration:</span> {ability.duration}s
            </div>
          )}
        </div>
        
        {ability.damage && (
          <div className="text-red-300 text-sm mb-2">
            <span className="text-gray-400">Damage:</span> {ability.damage}
          </div>
        )}
        
        {ability.effects && ability.effects.length > 0 && (
          <div className="text-xs">
            <span className="text-gray-400">Effects:</span>
            <ul className="list-disc list-inside text-gray-300 mt-1">
              {ability.effects.map((effect, index) => (
                <li key={index}>{effect}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function AbilitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<AbilityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAbilities = searchQuery
    ? searchAbilities(searchQuery)
    : selectedCategory === 'all'
    ? ABILITIES
    : getAbilitiesByCategory(selectedCategory);

  const categories = Object.keys(ABILITY_CATEGORIES) as AbilityCategory[];

  return (
    <Layout pageTranslationNamespaces={pageNamespaces}>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-4xl md:text-5xl mb-6">Abilities</h1>
        <p className="text-gray-300 mb-8">A comprehensive list of all abilities in Island Troll Tribes, organized by category and class.</p>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search abilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-black/30 border border-amber-500/30 rounded-lg text-white placeholder-gray-400 focus:border-amber-400/50 focus:outline-none"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AbilityCategory | 'all')}
              className="px-4 py-2 bg-black/30 border border-amber-500/30 rounded-lg text-white focus:border-amber-400/50 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {ABILITY_CATEGORIES[category]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-400">
            Showing {filteredAbilities.length} of {ABILITIES.length} abilities
          </div>
        </div>

        {/* Abilities Grid */}
        {filteredAbilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAbilities.map((ability) => (
              <AbilityCard key={ability.id} ability={ability} />
            ))}
          </div>
        ) : (
          <div className="bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg">
              {searchQuery ? `No abilities found matching "${searchQuery}"` : 'No abilities found for the selected category.'}
            </p>
          </div>
        )}

        {/* Category Summary */}
        {!searchQuery && selectedCategory === 'all' && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(category => {
              const categoryAbilities = getAbilitiesByCategory(category);
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-black/20 backdrop-blur-sm border border-amber-500/20 rounded-lg p-4 hover:border-amber-400/50 transition-colors text-left"
                >
                  <h3 className="font-medieval text-amber-400 mb-2">{ABILITY_CATEGORIES[category]}</h3>
                  <p className="text-gray-300 text-sm">{categoryAbilities.length} abilities</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}


