import React from 'react';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { Card } from '@/features/infrastructure/components/ui/Card';
import type { PlayerStats, CategoryStats } from '../types';

interface PlayerCardProps {
  player: PlayerStats;
  isSelected?: boolean;
  compareMode?: boolean;
  onClick?: () => void;
  showLink?: boolean;
}

function getBestCategory(player: PlayerStats): [string, CategoryStats] | null {
  const categories = Object.entries(player.categories || {});
  if (categories.length === 0) return null;
  
  // Find category with highest ELO
  return categories.reduce<[string, CategoryStats] | null>((best, [name, stats]) => {
    const bestScore = best ? best[1].score : 0;
    return stats.score > bestScore ? [name, stats] : best;
  }, null);
}

export function PlayerCard({ player, isSelected = false, compareMode = false, onClick, showLink = true }: PlayerCardProps) {
  const bestCategory = getBestCategory(player);
  const bestStats = bestCategory ? bestCategory[1] : null;
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  const cardContent = (
    <Card 
      variant="medieval" 
      className={`p-6 transition-colors h-full ${
        compareMode 
          ? isSelected 
            ? 'border-amber-500 bg-amber-500/10 cursor-pointer' 
            : 'hover:border-amber-500/50 cursor-pointer'
          : 'hover:border-amber-500/50 cursor-pointer'
      }`}
      onClick={onClick ? handleCardClick : undefined}
    >
      <h3 className="text-xl font-semibold text-amber-400 mb-3">{player.name}</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Games:</span>
          <span className="text-amber-300 font-semibold">{player.totalGames}</span>
        </div>
        
        {bestStats && bestCategory && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-500">Best Category:</span>
              <span className="text-amber-300">{bestCategory[0].toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ELO:</span>
              <span className="text-amber-400 font-semibold">{Math.round(bestStats.score)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Win Rate:</span>
              <span className="text-green-400">
                {bestStats.games > 0
                  ? `${((bestStats.wins / bestStats.games) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Record:</span>
              <span className="text-white">
                {bestStats.wins}W - {bestStats.losses}L
                {bestStats.draws > 0 ? ` - ${bestStats.draws}D` : ''}
              </span>
            </div>
          </>
        )}
        
        {player.lastPlayed && (
          <div className="flex justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-amber-500/20">
            <span>Last Played:</span>
            <span>
              {(() => {
                const date = typeof player.lastPlayed === 'string' 
                  ? new Date(player.lastPlayed)
                  : (player.lastPlayed as Timestamp)?.toDate?.() || new Date(String(player.lastPlayed));
                return date.toLocaleDateString();
              })()}
            </span>
          </div>
        )}
      </div>
    </Card>
  );

  if (showLink && !compareMode) {
    return (
      <Link href={`/players/${encodeURIComponent(player.name)}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

