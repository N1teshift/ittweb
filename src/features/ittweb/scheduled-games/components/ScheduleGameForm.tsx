import React, { useState, FormEvent } from 'react';
import { TeamSize, GameType, CreateScheduledGame } from '@/types/scheduledGame';
import { getUserTimezone, convertLocalToUTC, getCommonTimezones, getTimezoneAbbreviation } from '../utils/timezoneUtils';

interface ScheduleGameFormProps {
  onSubmit: (gameData: CreateScheduledGame, addCreatorToParticipants: boolean) => Promise<void>;
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

export default function ScheduleGameForm({ onSubmit, onCancel, isSubmitting = false }: ScheduleGameFormProps) {
  const userTimezone = getUserTimezone();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState(userTimezone);
  const [teamSize, setTeamSize] = useState<TeamSize>('1v1');
  const [customTeamSize, setCustomTeamSize] = useState('');
  const [gameType, setGameType] = useState<GameType>('normal');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [addCreatorToParticipants, setAddCreatorToParticipants] = useState(true); // Default checked
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    // Validate the selected date/time is in the future
    const localDateTime = `${selectedDate}T${selectedTime}`;
    const selectedDateTime = new Date(localDateTime);
    if (selectedDateTime < new Date()) {
      setError('Scheduled date and time must be in the future');
      return;
    }

    // Convert local date/time to UTC
    const utcDateTime = convertLocalToUTC(selectedDate, selectedTime, selectedTimezone);

    const gameData: CreateScheduledGame = {
      scheduledDateTime: utcDateTime,
      timezone: selectedTimezone,
      teamSize,
      customTeamSize: teamSize === 'custom' ? customTeamSize : undefined,
      gameType,
      modes: selectedModes,
    };

    try {
      await onSubmit(gameData, addCreatorToParticipants);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule game';
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

  const commonTimezones = getCommonTimezones();
  const tzAbbreviation = getTimezoneAbbreviation(selectedTimezone);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-medieval-brand text-amber-400 mb-6">Schedule a Game</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-amber-500 mb-2">Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-500 mb-2">Time *</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-500 mb-2">Timezone *</label>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                {commonTimezones.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({getTimezoneAbbreviation(tz.value)})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-400 mt-1">
                Selected timezone: {tzAbbreviation}
              </p>
            </div>
          </div>

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

          {/* Add Creator to Participants */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={addCreatorToParticipants}
                onChange={(e) => setAddCreatorToParticipants(e.target.checked)}
                className="mr-2"
              />
              <span className="text-white">Add creator to participants</span>
            </label>
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
              {isSubmitting ? 'Scheduling...' : 'Schedule Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

