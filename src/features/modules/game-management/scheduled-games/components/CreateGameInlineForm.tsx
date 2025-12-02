import { useState, FormEvent } from 'react';
import type {
  TeamSize,
  GameType,
  CreateScheduledGame,
  GameParticipant,
  ParticipantResult,
} from '@/features/modules/game-management/games/types';
import {
  getUserTimezone,
  convertLocalToUTC,
  getCommonTimezones,
  getTimezoneAbbreviation,
} from '../utils/timezoneUtils';

const GAME_MODES = ['Standard', 'Tournament', 'Sandbox'];
const PARTICIPANT_RESULTS: ParticipantResult[] = ['winner', 'loser', 'draw'];

const INITIAL_PARTICIPANTS: ParticipantInput[] = [
  { name: '', discordId: '', result: 'winner' },
  { name: '', discordId: '', result: 'loser' },
];

const buildDefaultParticipants = (): ParticipantInput[] =>
  INITIAL_PARTICIPANTS.map((participant) => ({ ...participant }));

type ParticipantInput = {
  name: string;
  discordId: string;
  result: ParticipantResult;
};

interface CreateGameInlineFormProps {
  onClose: () => void;
}

export default function CreateGameInlineForm({ onClose }: CreateGameInlineFormProps) {
  const userTimezone = getUserTimezone();
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(now.toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState(now.toISOString().slice(11, 16));
  const [selectedTimezone, setSelectedTimezone] = useState(userTimezone);
  const [teamSize, setTeamSize] = useState<TeamSize>('1v1');
  const [customTeamSize, setCustomTeamSize] = useState('');
  const [gameType, setGameType] = useState<GameType>('normal');
  const [gameVersion, setGameVersion] = useState('v3.28');
  const [gameLength, setGameLength] = useState(1800);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [participants, setParticipants] = useState<ParticipantInput[]>(() => buildDefaultParticipants());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const commonTimezones = getCommonTimezones();
  const tzAbbreviation = getTimezoneAbbreviation(selectedTimezone);

  const handleParticipantChange = (index: number, field: keyof ParticipantInput, value: string) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'result' ? (value as ParticipantResult) : value,
      };
      return next;
    });
  };

  const addParticipant = () => {
    setParticipants((prev) => [...prev, { name: '', discordId: '', result: 'loser' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleModeToggle = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    const utcDateTime = convertLocalToUTC(selectedDate, selectedTime, selectedTimezone);

    const participantSeed = Date.now();
    const preparedParticipants = participants
      .map((participant, index): GameParticipant | null => {
        const name = participant.name.trim();
        if (!name) {
          return null;
        }
        const nowIso = new Date().toISOString();
        const fallbackId = `manual-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'player'}-${participantSeed + index}`;
        return {
          discordId: participant.discordId.trim() || fallbackId,
          name,
          joinedAt: nowIso,
          result: participant.result,
        };
      })
      .filter((participant): participant is GameParticipant => participant !== null);

    if (preparedParticipants.length < 2) {
      setError('Please add at least two participants with names.');
      return;
    }

    const hasWinner = preparedParticipants.some((participant) => participant.result === 'winner');
    const hasLoser = preparedParticipants.some((participant) => participant.result === 'loser');

    if (!hasWinner || !hasLoser) {
      setError('Select at least one winner and one loser.');
      return;
    }

    const payload: CreateScheduledGame = {
      scheduledDateTime: utcDateTime,
      timezone: selectedTimezone,
      teamSize,
      customTeamSize: teamSize === 'custom' ? customTeamSize : undefined,
      gameType,
      gameVersion,
      gameLength,
      modes: selectedModes,
      participants: preparedParticipants,
    };

    setSubmitting(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          gameState: 'scheduled',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create game');
      }
      setSuccess('Game entry created and archived! Available for testing immediately.');
      setParticipants(buildDefaultParticipants());
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medieval-brand text-amber-400">Create Game (Manual Entry)</h2>
            <p className="text-sm text-gray-400 mt-1">
              Manually create a game record by entering game details. This is useful for testing or when a replay file is not available. 
              The game will be immediately recorded and available in the games list.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
            aria-label="Close create game form"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-amber-500 mb-2">Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
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
                {commonTimezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({getTimezoneAbbreviation(tz.value)})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-400 mt-1">Selected timezone: {tzAbbreviation}</p>
            </div>
          </div>

          <div>
            <label className="block text-amber-500 mb-2">Team Size *</label>
            <div className="grid grid-cols-4 gap-2">
              {(['1v1', '2v2', '3v3', '4v4', '5v5', '6v6', 'custom'] as TeamSize[]).map((size) => (
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
                placeholder="e.g., 2v2v2, 3v3v3"
                className="w-full mt-2 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                required
              />
            )}
          </div>

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

          <div>
            <label className="block text-amber-500 mb-2">Game Length *</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={gameLength}
                onChange={(e) => setGameLength(parseInt(e.target.value, 10) || 0)}
                min={60}
                step={60}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
              <div className="text-gray-300 text-sm flex items-center">
                {gameLength >= 60
                  ? `${Math.floor(gameLength / 60)} minute${Math.floor(gameLength / 60) !== 1 ? 's' : ''}`
                  : `${gameLength} second${gameLength !== 1 ? 's' : ''}`}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-amber-500 mb-2">Game Modes</label>
            <div className="space-y-2">
              {GAME_MODES.map((mode) => (
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
          </div>

          <div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <label className="text-amber-500">Participants *</label>
              <button
                type="button"
                onClick={addParticipant}
                className="px-3 py-1.5 rounded border border-amber-500/40 text-amber-300 text-sm hover:bg-amber-500/10 transition"
              >
                + Add Participant
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              List every participant and flag the winners and losers so the replay uploader knows who succeeded.
            </p>
            <div className="mt-4 space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={`participant-${index}`}
                  className="rounded border border-gray-700 bg-gray-900/40 p-3 grid gap-3 md:grid-cols-[1fr,1fr,140px,auto]"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Display Name *</label>
                    <input
                      type="text"
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                      placeholder="Player name"
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Discord ID (optional)
                    </label>
                    <input
                      type="text"
                      value={participant.discordId}
                      onChange={(e) => handleParticipantChange(index, 'discordId', e.target.value)}
                      placeholder="123456789012345678"
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Result</label>
                    <select
                      value={participant.result}
                      onChange={(e) => handleParticipantChange(index, 'result', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    >
                      {PARTICIPANT_RESULTS.map((result) => (
                        <option key={result} value={result}>
                          {result === 'draw'
                            ? 'Draw'
                            : result.charAt(0).toUpperCase() + result.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      disabled={participants.length <= 2}
                      className="w-full px-3 py-2 rounded border border-red-500/40 text-red-300 text-sm hover:bg-red-500/10 transition disabled:opacity-40"
                      title={participants.length <= 2 ? 'Keep at least two participants' : 'Remove participant'}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-500/40 rounded px-4 py-2 text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/40 border border-green-500/40 rounded px-4 py-2 text-green-200 text-sm">
              {success}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Game'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel creating game"
              className="flex-1 px-4 py-2 bg-black/40 border border-amber-500/30 text-amber-300 rounded-lg font-medium hover:bg-black/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

