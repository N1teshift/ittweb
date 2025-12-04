import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ErrorBoundary } from '@/features/infrastructure/components';
import Link from 'next/link';
import { useState } from 'react';
import { ABILITIES, ABILITY_CATEGORIES, AbilityCategory, AbilityData, getAbilitiesByCategory, searchAbilities } from '@/features/modules/content/guides/data/abilities';
import GuideCard from '@/features/modules/content/guides/components/GuideCard';
import GuideIcon from '@/features/modules/content/guides/components/GuideIcon';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

function AbilityCard({ ability }: { ability: AbilityData }) {
  const primaryBadges = [
    ability.manaCost !== undefined
      ? { label: `Mana: ${ability.manaCost}`, variant: 'blue' as const }
      : null,
    ability.cooldown !== undefined
      ? { label: `Cooldown: ${ability.cooldown}s`, variant: 'purple' as const }
      : null,
    ability.range !== undefined
      ? { label: `Range: ${ability.range}`, variant: 'green' as const }
      : null,
    ability.areaOfEffect !== undefined
      ? { label: `AOE: ${ability.areaOfEffect}`, variant: 'green' as const }
      : null,
    ability.maxTargets !== undefined
      ? { label: `Targets: ${ability.maxTargets}`, variant: 'purple' as const }
      : null,
    ability.duration !== undefined
      ? { label: `Duration: ${ability.duration}s`, variant: 'amber' as const }
      : null,
    ability.damage
      ? { label: `Damage: ${ability.damage}`, variant: 'red' as const }
      : null,
  ].filter(Boolean) as { label: string; variant: 'blue' | 'purple' | 'green' | 'amber' | 'red' }[];

  const secondaryBadges = [
    ability.hotkey
      ? { label: `[${ability.hotkey}]`, variant: 'amber' as const }
      : null,
    ability.classRequirement
      ? { label: ability.classRequirement, variant: 'amber' as const }
      : null,
    ability.availableToClasses && ability.availableToClasses.length > 0
      ? { label: `${ability.availableToClasses.length} class${ability.availableToClasses.length > 1 ? 'es' : ''}`, variant: 'blue' as const }
      : null,
    ability.category
      ? { label: ABILITY_CATEGORIES[ability.category] || ability.category, variant: 'gray' as const }
      : null,
  ].filter(Boolean) as { label: string; variant: 'amber' | 'gray' | 'blue' }[];

  const footer = ability.effects && ability.effects.length > 0 && (
    <div className="text-xs">
      <span className="text-gray-400">Effects:</span>
      <ul className="list-disc list-inside text-gray-300 mt-1">
        {ability.effects.map((effect, index) => (
          <li key={index}>{effect}</li>
        ))}
      </ul>
    </div>
  );

  const icon = (
    <GuideIcon 
      category="abilities" 
      name={ability.name} 
      size={48}
    />
  );

  return (
    <GuideCard
      href={`/guides/abilities/${ability.id}`}
      title={ability.name}
      icon={icon}
      description={ability.description}
      primaryTagGroup={primaryBadges.length ? { badges: primaryBadges } : undefined}
      secondaryTagGroup={secondaryBadges.length ? { badges: secondaryBadges } : undefined}
      footer={footer || undefined}
    />
  );
}

export default function AbilitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<AbilityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const hasAbilityData = ABILITIES.length > 0;

  if (!hasAbilityData) {
    return (
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-4">Abilities</h1>
        <p className="text-gray-300 mb-6">Ability data has not been generated yet.</p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-amber-100">
          <p className="font-semibold mb-2">No ability entries found.</p>
          <p className="text-sm text-amber-100/90">
            Run <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">python src/features/infrastructure/extraction/scripts/current/manage_extraction.py pipeline</code>
            {' '}to regenerate <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">abilities.ts</code> from the game data.
          </p>
        </div>
      </div>
    );
  }

  const filteredAbilities = searchQuery
    ? (() => {
        const results = searchAbilities(searchQuery);
        // Also filter by category if selected
        return selectedCategory === 'all' 
          ? results 
          : results.filter(a => a.category === selectedCategory);
      })()
    : selectedCategory === 'all'
    ? ABILITIES
    : getAbilitiesByCategory(selectedCategory);

  const categories = Object.keys(ABILITY_CATEGORIES) as AbilityCategory[];

  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-6">Abilities</h1>
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
    </ErrorBoundary>
  );
}



