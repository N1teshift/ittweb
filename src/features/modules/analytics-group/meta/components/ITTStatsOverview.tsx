/**
 * ITT Stats Overview Component - Shows community-wide ITT statistics
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/features/infrastructure/components';
import { AnimalKillsDisplay } from '@/features/modules/shared/components';
import type { AggregateITTStats, TopHunterEntry, TopHealerEntry } from '../../analytics/types';

interface ITTStatsOverviewProps {
  category?: string;
  startDate?: string;
  endDate?: string;
}

function StatCard({ 
  icon, 
  iconImage,
  label, 
  value, 
  colorClass 
}: { 
  icon?: string; 
  iconImage?: string;
  label: string; 
  value: number; 
  colorClass: string;
}) {
  return (
    <div className="bg-black/20 rounded-lg p-4 border border-amber-500/10 text-center">
      {iconImage ? (
        <div className="flex justify-center mb-1">
          <Image
            src={iconImage}
            alt={label}
            width={40}
            height={40}
            className="w-10 h-10"
            unoptimized
          />
        </div>
      ) : icon ? (
        <div className="text-2xl mb-1">{icon}</div>
      ) : null}
      <div className={`text-xl font-bold ${colorClass}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function LeaderboardEntry({ 
  rank, 
  name, 
  value, 
  label 
}: { 
  rank: number; 
  name: string; 
  value: number; 
  label: string;
}) {
  const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
  const rankColor = rankColors[rank - 1] || 'text-gray-400';
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-amber-500/10 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`font-bold ${rankColor}`}>#{rank}</span>
        <span className="text-amber-300">{name}</span>
      </div>
      <div className="text-right">
        <span className="text-white font-medium">{value.toLocaleString()}</span>
        <span className="text-gray-500 text-xs ml-1">{label}</span>
      </div>
    </div>
  );
}

export function ITTStatsOverview({ category, startDate, endDate }: ITTStatsOverviewProps) {
  const [stats, setStats] = useState<AggregateITTStats | null>(null);
  const [topHunters, setTopHunters] = useState<TopHunterEntry[]>([]);
  const [topHealers, setTopHealers] = useState<TopHealerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const [statsRes, huntersRes, healersRes] = await Promise.all([
          fetch(`/api/analytics/itt-stats?${params.toString()}`),
          fetch(`/api/analytics/top-hunters?${params.toString()}&limit=5`),
          fetch(`/api/analytics/top-healers?${params.toString()}&limit=5`),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data || data);
        }

        if (huntersRes.ok) {
          const data = await huntersRes.json();
          setTopHunters((data.data || data) || []);
        }

        if (healersRes.ok) {
          const data = await healersRes.json();
          setTopHealers((data.data || data) || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ITT stats');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [category, startDate, endDate]);

  if (loading) {
    return (
      <Card variant="medieval" className="p-6 animate-pulse">
        <div className="h-6 bg-amber-500/20 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-amber-500/10 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return null; // Silently fail - this is optional content
  }

  // Check if we have any meaningful data
  const hasData = stats.totalGames > 0 || 
                  stats.totalDamageDealt > 0 || 
                  stats.totalAnimalKills?.total > 0;

  if (!hasData) {
    return null;
  }

  return (
    <Card variant="medieval" className="p-6">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">
        Community ITT Statistics
      </h2>

      {/* Aggregate Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard icon="🎮" label="Games" value={stats.totalGames} colorClass="text-amber-300" />
        <StatCard iconImage="/icons/itt/btnspiritwalkeradepttraining.png" label="Total Damage" value={stats.totalDamageDealt} colorClass="text-red-400" />
        <StatCard icon="💚" label="Self Healing" value={stats.totalHealing?.selfHealing || 0} colorClass="text-green-400" />
        <StatCard icon="💙" label="Ally Healing" value={stats.totalHealing?.allyHealing || 0} colorClass="text-blue-400" />
        <StatCard iconImage="/icons/itt/btnmonsterlure.png" label="Meat Eaten" value={stats.totalMeatEaten} colorClass="text-orange-400" />
        <StatCard iconImage="/icons/itt/btnchestofgold.png" label="Gold Acquired" value={stats.totalGoldAcquired || 0} colorClass="text-yellow-400" />
      </div>

      {/* Animal Kills Breakdown */}
      {stats.totalAnimalKills && stats.totalAnimalKills.total > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Individual Animal Kills</h3>
          <AnimalKillsDisplay
            kills={stats.totalAnimalKills}
            showTotal={false}
            compact={false}
            showLabels={true}
          />
        </div>
      )}

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topHunters.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">🏆 Top Hunters</h3>
            <div className="bg-black/20 rounded-lg p-3">
              {topHunters.slice(0, 5).map((hunter, idx) => (
                <LeaderboardEntry
                  key={hunter.playerName}
                  rank={idx + 1}
                  name={hunter.playerName}
                  value={hunter.totalKills}
                  label="kills"
                />
              ))}
            </div>
          </div>
        )}

        {topHealers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">💚 Top Healers</h3>
            <div className="bg-black/20 rounded-lg p-3">
              {topHealers.slice(0, 5).map((healer, idx) => (
                <LeaderboardEntry
                  key={healer.playerName}
                  rank={idx + 1}
                  name={healer.playerName}
                  value={healer.totalHealing}
                  label="HP"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

