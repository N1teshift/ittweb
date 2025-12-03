import React, { useState, useEffect } from 'react';
import { Card } from '@/features/infrastructure/components/ui/Card';
import { Tooltip } from '@/features/infrastructure/components/ui';
import type { GamePlayer } from '@/features/modules/game-management/games/types';

interface PlayerITTStatsCardProps {
  playerName: string;
}

interface AggregatedITTStats {
  gamesWithStats: number;
  totalDamageDealt: number;
  totalSelfHealing: number;
  totalAllyHealing: number;
  totalMeatEaten: number;
  totalGoldAcquired: number;
  animalKills: {
    elk: number;
    hawk: number;
    snake: number;
    wolf: number;
    bear: number;
    panther: number;
    total: number;
  };
}

const EMPTY_STATS: AggregatedITTStats = {
  gamesWithStats: 0,
  totalDamageDealt: 0,
  totalSelfHealing: 0,
  totalAllyHealing: 0,
  totalMeatEaten: 0,
  totalGoldAcquired: 0,
  animalKills: { elk: 0, hawk: 0, snake: 0, wolf: 0, bear: 0, panther: 0, total: 0 },
};

function aggregatePlayerStats(players: GamePlayer[]): AggregatedITTStats {
  const stats = { ...EMPTY_STATS, animalKills: { ...EMPTY_STATS.animalKills } };
  
  for (const player of players) {
    // Check if this player has any ITT stats
    const hasStats = player.damageDealt !== undefined ||
                     player.selfHealing !== undefined ||
                     player.meatEaten !== undefined ||
                     player.killsElk !== undefined;
    
    if (hasStats) {
      stats.gamesWithStats++;
      stats.totalDamageDealt += player.damageDealt || 0;
      stats.totalSelfHealing += player.selfHealing || 0;
      stats.totalAllyHealing += player.allyHealing || 0;
      stats.totalMeatEaten += player.meatEaten || 0;
      stats.totalGoldAcquired += player.goldAcquired || 0;
      stats.animalKills.elk += player.killsElk || 0;
      stats.animalKills.hawk += player.killsHawk || 0;
      stats.animalKills.snake += player.killsSnake || 0;
      stats.animalKills.wolf += player.killsWolf || 0;
      stats.animalKills.bear += player.killsBear || 0;
      stats.animalKills.panther += player.killsPanther || 0;
    }
  }
  
  stats.animalKills.total = 
    stats.animalKills.elk + stats.animalKills.hawk + stats.animalKills.snake +
    stats.animalKills.wolf + stats.animalKills.bear + stats.animalKills.panther;
  
  return stats;
}

function StatBlock({ 
  icon, 
  label, 
  value, 
  average, 
  colorClass 
}: { 
  icon: string; 
  label: string; 
  value: number; 
  average: number;
  colorClass: string;
}) {
  return (
    <div className="bg-black/20 rounded-lg p-3 border border-amber-500/10">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className={`text-xl font-bold ${colorClass}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-gray-500">
        ~{average.toFixed(1)}/game
      </div>
    </div>
  );
}

export function PlayerITTStatsCard({ playerName }: PlayerITTStatsCardProps) {
  const [stats, setStats] = useState<AggregatedITTStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerGamesAndAggregate() {
      try {
        setLoading(true);
        setError(null);

        // Fetch games for this player with increased limit
        const response = await fetch(
          `/api/games?player=${encodeURIComponent(playerName)}&limit=100&gameState=completed`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();
        const games = data.data?.games || data.games || [];
        
        // Collect all player entries for this player across all games
        const playerEntries: GamePlayer[] = [];
        
        for (const game of games) {
          // Need to fetch full game with players
          const gameResponse = await fetch(`/api/games/${game.id}`);
          if (gameResponse.ok) {
            const gameData = await gameResponse.json();
            const fullGame = gameData.data || gameData;
            
            // Find this player in the game
            const playerEntry = fullGame.players?.find(
              (p: GamePlayer) => p.name.toLowerCase() === playerName.toLowerCase()
            );
            
            if (playerEntry) {
              playerEntries.push(playerEntry);
            }
          }
        }

        const aggregated = aggregatePlayerStats(playerEntries);
        setStats(aggregated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (playerName) {
      fetchPlayerGamesAndAggregate();
    }
  }, [playerName]);

  if (loading) {
    return (
      <Card variant="medieval" className="p-6 animate-pulse">
        <div className="h-6 bg-amber-500/20 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-amber-500/10 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return null; // Silently fail - ITT stats are optional
  }

  if (!stats || stats.gamesWithStats === 0) {
    return null; // No ITT stats available
  }

  const avg = (val: number) => stats.gamesWithStats > 0 ? val / stats.gamesWithStats : 0;

  return (
    <Card variant="medieval" className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-amber-400">Lifetime Statistics</h2>
        <span className="text-sm text-gray-500">
          Based on {stats.gamesWithStats} games with stats
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatBlock
          icon="🗡️"
          label="Damage Dealt"
          value={stats.totalDamageDealt}
          average={avg(stats.totalDamageDealt)}
          colorClass="text-red-400"
        />
        <StatBlock
          icon="💚"
          label="Self Healing"
          value={stats.totalSelfHealing}
          average={avg(stats.totalSelfHealing)}
          colorClass="text-green-400"
        />
        <StatBlock
          icon="💙"
          label="Ally Healing"
          value={stats.totalAllyHealing}
          average={avg(stats.totalAllyHealing)}
          colorClass="text-blue-400"
        />
        <StatBlock
          icon="🥩"
          label="Meat Eaten"
          value={stats.totalMeatEaten}
          average={avg(stats.totalMeatEaten)}
          colorClass="text-orange-400"
        />
        <StatBlock
          icon="💰"
          label="Gold Acquired"
          value={stats.totalGoldAcquired}
          average={avg(stats.totalGoldAcquired)}
          colorClass="text-yellow-400"
        />
        <StatBlock
          icon="🦌"
          label="Total Kills"
          value={stats.animalKills.total}
          average={avg(stats.animalKills.total)}
          colorClass="text-amber-300"
        />
      </div>

      {/* Animal Kills Breakdown */}
      {stats.animalKills.total > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Animal Kills Breakdown</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Elk', count: stats.animalKills.elk, emoji: '🦌' },
              { name: 'Hawk', count: stats.animalKills.hawk, emoji: '🦅' },
              { name: 'Snake', count: stats.animalKills.snake, emoji: '🐍' },
              { name: 'Wolf', count: stats.animalKills.wolf, emoji: '🐺' },
              { name: 'Bear', count: stats.animalKills.bear, emoji: '🐻' },
              { name: 'Panther', count: stats.animalKills.panther, emoji: '🐆' },
            ].filter(a => a.count > 0).map(animal => (
              <Tooltip key={animal.name} content={`${animal.name} kills`}>
                <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 rounded-full">
                  <span>{animal.emoji}</span>
                  <span className="text-amber-300">{animal.count}</span>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

