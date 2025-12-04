import React, { useState, FormEvent, useEffect } from 'react';
import type { TeamSize, GameType, Game } from '@/features/modules/game-management/games/types';
import { formatDateTimeInTimezone } from '../utils/timezoneUtils';
import { timestampToIso } from '@/features/infrastructure/utils';

interface EditGameFormProps {
  game: Game;
  onSubmit: (updates: {
    teamSize: TeamSize;
    customTeamSize?: string;
    gameType: GameType;
    gameVersion?: string;
    gameLength?: number;
    modes: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Placeholder for game modes - will be updated when user provides the list
const GAME_MODES: string[] = [
  'Standard',
  'Custom Mode 1',
  'Custom Mode 2',
  // Add more modes when provided
];

export default function EditGameForm({ game, onSubmit, onCancel, isSubmitting = false }: EditGameFormProps) {
  const [teamSize, setTeamSize] = useState<TeamSize>(game.teamSize || '1v1');
  const [customTeamSize, setCustomTeamSize] = useState(game.customTeamSize || '');
  const [gameType, setGameType] = useState<GameType>(game.gameType || 'normal');
  const [gameVersion, setGameVersion] = useState<string>(game.gameVersion || 'v3.28');
  const [gameLength, setGameLength] = useState<number>(game.gameLength || 1800);
  const [selectedModes, setSelectedModes] = useState<string[]>(game.modes || []);
  const [error, setError] = useState('');

  useEffect(() => {
    setTeamSize(game.teamSize || '1v1');
    setCustomTeamSize(game.customTeamSize || '');
    setGameType(game.gameType || 'normal');
    setGameVersion(game.gameVersion || 'v3.28');
    setGameLength(game.gameLength || 1800);
    setSelectedModes(game.modes || []);
  }, [game]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (teamSize === 'custom' && !customTeamSize.trim()) {
      setError('Please specify custom team size');
      return;
    }

    const updates = {
      teamSize,
      customTeamSize: teamSize === 'custom' ? customTeamSize : undefined,
      gameType,
      gameVersion,
      gameLength,
      modes: selectedModes,
    };

    try {
      await onSubmit(updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update game';
      setError(errorMessage);
    }
  };

  const handleModeToggle = (mode: string) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  const gameDate = formatDateTimeInTimezone(
    game.scheduledDateTime ? timestampToIso(game.scheduledDateTime) : new Date().toISOString(),
    game.timezone || 'UTC',
    {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-medieval-brand text-amber-400 mb-6">Edit Scheduled Game</h2>

        {/* Display game info that can't be edited */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded border border-gray-700">
          <div className="text-sm text-gray-400 space-y-1">
            <div><span className="text-amber-500">Scheduled Time:</span> {gameDate}</div>
            <div><span className="text-amber-500">Scheduled By:</span> {game.creatorName}</div>
            <div><span className="text-amber-500">Participants:</span> {game.participants?.length || 0}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Size */}
          <div>
            <label className="block text-amber-500 mb-2">Team Size *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['1v1', '2v2', '3v3', '4v4', '5v5', '6v6', 'custom'] as TeamSize[]).map(size => (
                <label key={size} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="teamSize"
                    value={size}
                    checked={teamSize === size}
                    onChange={(e) => setTeamSize(e.target.value as TeamSize)}
                    className="mr-2"
                  />
                  <span className="text-white">{size === 'custom' ? 'Custom' : size}</span>
                </label>
              ))}
            </div>
            {teamSize === 'custom' && (
              <input
                type="text"
                value={customTeamSize}
                onChange={(e) => setCustomTeamSize(e.target.value)}
                placeholder="e.g., 2v2v2, 3v3v3, etc."
                required
                className="w-full mt-2 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            )}
          </div>

          {/* Game Type */}
          <div>
            <label className="block text-amber-500 mb-2">Game Type *</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gameType"
                  value="normal"
                  checked={gameType === 'normal'}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                  className="mr-2"
                />
                <span className="text-white">Normal</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gameType"
                  value="elo"
                  checked={gameType === 'elo'}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                  className="mr-2"
                />
                <span className="text-white">ELO</span>
              </label>
            </div>
          </div>

          {/* Game Version */}
          <div>
            <label className="block text-amber-500 mb-2">Game Version *</label>
            <select
              value={gameVersion}
              onChange={(e) => setGameVersion(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="v3.28">v3.28</option>
            </select>
          </div>

          {/* Game Length */}
          <div>
            <label className="block text-amber-500 mb-2">Game Length *</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={gameLength}
                  onChange={(e) => setGameLength(parseInt(e.target.value, 10) || 0)}
                  min="60"
                  step="60"
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Duration in seconds"
                />
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <span>
                  {gameLength >= 60 
                    ? `${Math.floor(gameLength / 60)} minute${Math.floor(gameLength / 60) !== 1 ? 's' : ''}`
                    : `${gameLength} second${gameLength !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Common lengths: 15 min (900s), 30 min (1800s), 45 min (2700s), 60 min (3600s)
            </p>
          </div>

          {/* Game Modes */}
          <div>
            <label className="block text-amber-500 mb-2">Game Modes (Optional)</label>
            <div className="space-y-2">
              {GAME_MODES.map(mode => (
                <label key={mode} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModes.includes(mode)}
                    onChange={() => handleModeToggle(mode)}
                    className="mr-2"
                  />
                  <span className="text-white">{mode}</span>
                </label>
              ))}
            </div>
            {selectedModes.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {selectedModes.join(', ')}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded px-4 py-2 text-red-200">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


