import React, { useEffect, useState } from 'react';
import { PageHero } from '@/features/shared/components';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import { ActivityChart } from '../../analytics/components/ActivityChart';
import { GameLengthChart } from '../../analytics/components/GameLengthChart';
import { PlayerActivityChart } from '../../analytics/components/PlayerActivityChart';
import { ClassSelectionChart } from '../../analytics/components/ClassSelectionChart';
import { ClassWinRateChart } from '../../analytics/components/ClassWinRateChart';
import type {
  ActivityDataPoint,
  GameLengthDataPoint,
  PlayerActivityDataPoint,
  ClassSelectionData,
  ClassWinRateData,
} from '../../analytics/types';

interface MetaPageProps {
  pageNamespaces: string[];
}

interface MetaData {
  activity: ActivityDataPoint[];
  gameLength: GameLengthDataPoint[];
  playerActivity: PlayerActivityDataPoint[];
  classSelection: ClassSelectionData[];
  classWinRates: ClassWinRateData[];
}

export function MetaPage({ pageNamespaces: _pageNamespaces }: MetaPageProps) {
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');
  const [teamFormat, setTeamFormat] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchMetaData();
  }, [category, teamFormat, startDate, endDate]);

  const fetchMetaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (teamFormat) params.append('teamFormat', teamFormat);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/analytics/meta?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load meta statistics');
      }
      const result = await response.json();
      const data = result.data || result;
      setMetaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meta statistics');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setCategory('');
    setTeamFormat('');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Meta Statistics" description="View game meta statistics and trends" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-amber-500/20 rounded w-1/4"></div>
              <div className="h-4 bg-amber-500/10 rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Meta Statistics" description="View game meta statistics and trends" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <p className="text-red-400">Error: {error}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero title="Meta Statistics" description="View game meta statistics and trends" />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <Card variant="medieval" className="p-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-amber-400 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="4v4">4v4</option>
                <option value="5v5">5v5</option>
                <option value="6v6">6v6</option>
                <option value="ffa">FFA</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="teamFormat" className="block text-sm font-medium text-amber-400 mb-2">
                Team Format
              </label>
              <select
                id="teamFormat"
                value={teamFormat}
                onChange={(e) => setTeamFormat(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">All Formats</option>
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="4v4">4v4</option>
                <option value="5v5">5v5</option>
                <option value="6v6">6v6</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-amber-400 mb-2">
                From Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-amber-400 mb-2">
                To Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </Card>

        {/* Charts */}
        {metaData && (
          <>
            <ActivityChart data={metaData.activity} title="Activity (Games per Day)" />
            <GameLengthChart data={metaData.gameLength} title="Average Game Length" />
            <PlayerActivityChart data={metaData.playerActivity} title="Active Players per Month" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClassSelectionChart data={metaData.classSelection} title="Class Selection" />
              <ClassWinRateChart data={metaData.classWinRates} title="Class Win Rate" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

