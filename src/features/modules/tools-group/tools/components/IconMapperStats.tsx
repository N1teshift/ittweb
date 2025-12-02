import type { CategoryStat } from '@/features/modules/tools-group/tools/types/icon-mapper.types';

type IconMapperStatsProps = {
  stats: CategoryStat[];
  selectedCategory: string;
};

export default function IconMapperStats({ stats, selectedCategory }: IconMapperStatsProps) {
  return (
    <div className="mb-6 bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg p-4">
      <h2 className="font-medieval-brand text-xl mb-4">Mapping Progress</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.category}
            className={`p-3 rounded-lg border ${
              selectedCategory === stat.category
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-amber-500/30 bg-black/20'
            }`}
          >
            <div className="text-sm text-gray-400 mb-1 capitalize">{stat.category}</div>
            <div className="text-2xl font-bold text-amber-400 mb-1">{stat.percentage}%</div>
            <div className="text-xs text-gray-500">
              <span className="text-green-400">{stat.mapped} mapped</span>
              {' / '}
              <span className="text-red-400">{stat.unmapped} unmapped</span>
              {' / '}
              <span className="text-gray-400">{stat.total} total</span>
            </div>
            <div className="mt-2 h-2 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



