import React, { useState } from 'react';
import Link from 'next/link';
import { PageHero } from '@/features/infrastructure/components';
import { Card } from '@/features/infrastructure/components';
import { useClassesData } from '../hooks/useClassesData';

interface ClassesPageProps {
  pageNamespaces: string[];
}

export function ClassesPage({ pageNamespaces: _pageNamespaces }: ClassesPageProps) {
  const [category, setCategory] = useState<string>('');
  const { classes: classStats, isLoading: loading, error } = useClassesData(category || undefined);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <PageHero title="Class Statistics" description="View statistics for each troll class" />
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
        <PageHero title="Class Statistics" description="View statistics for each troll class" />
        <div className="container mx-auto px-4 py-8">
          <Card variant="medieval" className="p-8">
            <p className="text-red-400">Error: {error instanceof Error ? error.message : String(error)}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <PageHero title="Class Statistics" description="View statistics for each troll class" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-amber-400 mb-2">
            Filter by Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
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

        {/* Class Statistics List */}
        {classStats.length === 0 ? (
          <Card variant="medieval" className="p-8">
            <p className="text-gray-400">No class statistics available.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classStats.map((classStat) => (
              <Link key={classStat.id} href={`/classes/${encodeURIComponent(classStat.id)}`}>
                <Card variant="medieval" className="p-6 hover:border-amber-500/50 transition-colors cursor-pointer h-full">
                  <h3 className="text-xl font-semibold text-amber-400 mb-3 capitalize">
                    {classStat.id}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Games:</span>
                      <span className="text-amber-300 font-semibold">{classStat.totalGames}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Win Rate:</span>
                      <span className="text-green-400">
                        {classStat.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Record:</span>
                      <span className="text-white">
                        {classStat.totalWins}W - {classStat.totalLosses}L
                      </span>
                    </div>
                    {classStat.topPlayers.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-amber-500/20">
                        <span className="text-xs text-gray-400">Top Player:</span>
                        <p className="text-amber-300 text-sm font-medium">
                          {classStat.topPlayers[0].playerName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {classStat.topPlayers[0].wins}W - {classStat.topPlayers[0].losses}L 
                          ({classStat.topPlayers[0].winRate.toFixed(1)}%)
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


