import React from 'react';
import Link from 'next/link';
import type { StandingsEntry } from '../types';

interface LeaderboardRowProps {
  entry: StandingsEntry;
}

function LeaderboardRowComponent({ entry }: LeaderboardRowProps) {
  return (
    <tr className="border-b border-amber-500/10 hover:bg-amber-500/5">
      <td className="py-3 px-2 md:px-4 text-gray-300 font-semibold text-sm md:text-base">#{entry.rank}</td>
      <td className="py-3 px-2 md:px-4">
        <Link
          href={`/players/${encodeURIComponent(entry.name)}`}
          className="text-amber-300 hover:text-amber-200 text-sm md:text-base"
          aria-label={`View ${entry.name}'s profile`}
        >
          {entry.name}
        </Link>
      </td>
      <td className="py-3 px-2 md:px-4 text-right text-amber-400 font-semibold text-sm md:text-base">
        {Math.round(entry.score)}
      </td>
      <td className="py-3 px-2 md:px-4 text-right text-green-400 text-sm md:text-base hidden sm:table-cell">
        {entry.wins}
      </td>
      <td className="py-3 px-2 md:px-4 text-right text-red-400 text-sm md:text-base hidden sm:table-cell">
        {entry.losses}
      </td>
      <td className="py-3 px-2 md:px-4 text-right text-gray-300 text-sm md:text-base">
        {entry.winRate.toFixed(1)}%
      </td>
      <td className="py-3 px-2 md:px-4 text-right text-gray-400 text-sm md:text-base hidden md:table-cell">
        {entry.games}
      </td>
    </tr>
  );
}

// Memoize component to prevent unnecessary re-renders when props haven't changed
export const LeaderboardRow = React.memo(LeaderboardRowComponent);


