import { getStaticPropsWithTranslations } from '@/features/infrastructure/lib/server';
import { ErrorBoundary } from '@/features/infrastructure/components';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { ALL_UNITS, getUnitsByType, searchUnits, UnitType, UnitData } from '@/features/modules/content/guides/data/units/allUnits';
import GuideCard from '@/features/modules/content/guides/components/GuideCard';
import GuideIcon from '@/features/modules/content/guides/components/GuideIcon';

const pageNamespaces = ["common"];
export const getStaticProps = getStaticPropsWithTranslations(pageNamespaces);

const typeDisplayNames: Record<UnitType, string> = {
  'troll': 'Trolls',
  'animal': 'Animals',
  'boss': 'Bosses',
  'building': 'Buildings',
  'unit-dummy-item-reward': 'Unit Dummy Item Reward',
  'dummy': 'Dummy',
  'other': 'Other',
};

const typeEmojis: Record<UnitType, string> = {
  'troll': '👤',
  'animal': '🐺',
  'boss': '👹',
  'building': '🏠',
  'unit-dummy-item-reward': '🎁',
  'dummy': '🎭',
  'other': '❓',
};

function UnitCard({ unit }: { unit: UnitData }) {
  const statBadges: { label: string; variant: 'red' | 'blue' | 'green' | 'purple' | 'amber' }[] = [];
  
  if (unit.hp !== undefined) {
    statBadges.push({ label: `HP: ${unit.hp}`, variant: 'green' });
  }
  if (unit.damage !== undefined) {
    statBadges.push({ label: `Damage: ${unit.damage}`, variant: 'red' });
  }
  if (unit.armor !== undefined) {
    statBadges.push({ label: `Armor: ${unit.armor}`, variant: 'blue' });
  }
  if (unit.mana !== undefined) {
    statBadges.push({ label: `Mana: ${unit.mana}`, variant: 'purple' });
  }
  if (unit.moveSpeed !== undefined) {
    statBadges.push({ label: `Speed: ${unit.moveSpeed}`, variant: 'amber' });
  }

  const typeBadge = {
    label: typeDisplayNames[unit.type],
    variant: 'gray' as const,
  };

  const icon = (
    <GuideIcon 
      category="units" 
      name={unit.name} 
      size={48}
    />
  );

  return (
    <GuideCard
      href={`/guides/units/${encodeURIComponent(unit.id)}`}
      title={unit.name}
      icon={icon}
      description={unit.description || unit.tooltip || 'No description available.'}
      primaryTagGroup={statBadges.length > 0 ? { badges: statBadges } : undefined}
      secondaryTagGroup={{ badges: [typeBadge] }}
    />
  );
}

export default function UnitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<UnitType | 'all'>('all');
  const hasUnitData = ALL_UNITS.length > 0;

  const filteredUnits = useMemo(() => {
    let units = selectedType === 'all' ? ALL_UNITS : getUnitsByType(selectedType);
    
    if (searchQuery.trim()) {
      units = searchUnits(searchQuery);
      if (selectedType !== 'all') {
        units = units.filter(u => u.type === selectedType);
      }
    }
    
    return units;
  }, [searchQuery, selectedType]);

  const unitsByType = useMemo(() => {
    const result: Record<UnitType, number> = {
      'troll': 0,
      'animal': 0,
      'boss': 0,
      'building': 0,
      'unit-dummy-item-reward': 0,
      'dummy': 0,
      'other': 0,
    };
    ALL_UNITS.forEach(u => {
      result[u.type] = (result[u.type] || 0) + 1;
    });
    return result;
  }, []);

  if (!hasUnitData) {
    return (
      <ErrorBoundary>
      <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
        </div>

        <h1 className="font-medieval-brand text-2xl md:text-4xl mb-4">Units</h1>
        <p className="text-gray-300 mb-6">Unit data has not been generated yet.</p>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-amber-100">
          <p className="font-semibold mb-2">No unit entries available.</p>
          <p className="text-sm text-amber-100/90">
            Run <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">node scripts/convert-extracted-to-typescript.mjs</code>
            {' '}to rebuild <code className="px-1 py-0.5 bg-black/40 rounded text-amber-200">allUnits.ts</code>.
          </p>
        </div>
      </div>
      </ErrorBoundary>
    );
  }

  const totalUnits = ALL_UNITS.length;

  return (
    <ErrorBoundary>
    <div className="min-h-[calc(100vh-8rem)] px-6 py-10 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/guides" className="text-amber-400 hover:text-amber-300">← Back to Guides</Link>
      </div>

          <h1 className="font-medieval-brand text-2xl md:text-4xl mb-4">Units</h1>
      <p className="text-gray-300 mb-6">
        Browse all units in the game including trolls, animals, bosses, and more.
      </p>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        {(['troll', 'animal', 'boss', 'building', 'unit-dummy-item-reward', 'dummy', 'other'] as UnitType[]).map((type) => (
          <div
            key={type}
            className={`bg-black/30 backdrop-blur-sm border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedType === type
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-amber-500/30 hover:border-amber-500/50'
            }`}
            onClick={() => setSelectedType(selectedType === type ? 'all' : type)}
          >
            <div className="text-2xl mb-1">{typeEmojis[type]}</div>
            <div className="text-sm text-gray-400">{typeDisplayNames[type]}</div>
            <div className="text-lg font-semibold text-amber-400">{unitsByType[type]}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] bg-black/50 border border-amber-500/30 rounded px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as UnitType | 'all')}
            className="bg-black/50 border border-amber-500/30 rounded px-4 py-2 text-gray-100 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Types</option>
            {(['troll', 'animal', 'boss', 'building', 'unit-dummy-item-reward', 'dummy', 'other'] as UnitType[]).map((type) => (
              <option key={type} value={type}>
                {typeDisplayNames[type]}
              </option>
            ))}
          </select>
        </div>

        {filteredUnits.length > 0 && (
          <div className="text-sm text-gray-400">
            Showing {filteredUnits.length} of {totalUnits} units
            {selectedType !== 'all' && ` (${typeDisplayNames[selectedType]})`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="font-medieval-brand text-2xl text-gray-400 mb-2">No units found</h3>
          <p className="text-gray-500">Try adjusting your search keywords or filter selection.</p>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}



