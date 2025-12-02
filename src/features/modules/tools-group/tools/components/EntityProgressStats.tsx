import type { EntityStat } from '../types/icon-mapper.types';

type EntityProgressStatsProps = {
  stats: EntityStat[];
};

export default function EntityProgressStats({ stats }: EntityProgressStatsProps) {
  const categoryLabels: Record<string, string> = {
    abilities: 'Abilities',
    units: 'Units',
    items: 'Items',
    buildings: 'Buildings',
  };

  const categoryColors: Record<string, string> = {
    abilities: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    units: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    items: 'bg-green-500/20 text-green-300 border-green-500/30',
    buildings: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };

  const progressBarColors: Record<string, string> = {
    abilities: 'bg-blue-500',
    units: 'bg-purple-500',
    items: 'bg-green-500',
    buildings: 'bg-amber-500',
  };

  if (!stats || stats.length === 0) {
    return (
      <div className="mb-6 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4">
        <h2 className="font-medieval-brand text-xl mb-4">Entity Mapping Progress</h2>
        <p className="text-gray-400 text-center py-4">No entity data available yet.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4">
      <h2 className="font-medieval-brand text-xl mb-4">Entity Mapping Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.category}
            className={`p-4 rounded-lg border ${categoryColors[stat.category] || 'border-amber-500/30 bg-black/20'}`}
          >
            <div className="text-sm text-gray-400 mb-2">{categoryLabels[stat.category] || stat.category}</div>
            <div className="text-3xl font-bold text-amber-400 mb-2">{stat.percentage}%</div>
            <div className="text-xs text-gray-500 mb-3">
              <span className="text-green-400">{stat.mapped} mapped</span>
              {' / '}
              <span className="text-red-400">{stat.unmapped} unmapped</span>
              {' / '}
              <span className="text-gray-400">{stat.total} total</span>
            </div>
            <div className="h-3 bg-black/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressBarColors[stat.category] || 'bg-amber-500'} transition-all duration-300`}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


