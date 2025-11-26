import React, { useState } from 'react';
import { Card } from '@/features/infrastructure/shared/components/ui/Card';
import { Button } from '@/features/infrastructure/shared/components/ui/Button';
import { Input } from '@/features/infrastructure/shared/components/ui/Input';
import type { CreateGame } from '@/features/ittweb/games/types';

export default function CreateGameTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<CreateGame>({
    gameId: 1001,
    datetime: new Date().toISOString(),
    duration: 1800,
    gamename: 'Test Game',
    map: 'Island Troll Tribes',
    creatorname: 'TestCreator',
    ownername: 'TestOwner',
    category: '1v1',
    players: [
      { name: 'Player1', pid: 0, flag: 'winner' },
      { name: 'Player2', pid: 1, flag: 'loser' },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(`Game created successfully! ID: ${data.data.id}`);
      
      // Reset form with incremented gameId
      setFormData({
        ...formData,
        gameId: formData.gameId + 1,
        datetime: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = () => {
    setFormData({
      ...formData,
      players: [
        ...formData.players,
        {
          name: `Player${formData.players.length + 1}`,
          pid: formData.players.length,
          flag: 'loser',
        },
      ],
    });
  };

  const removePlayer = (index: number) => {
    setFormData({
      ...formData,
      players: formData.players.filter((_, i) => i !== index).map((p, i) => ({ ...p, pid: i })),
    });
  };

  const updatePlayer = (index: number, field: string, value: string) => {
    const newPlayers = [...formData.players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setFormData({ ...formData, players: newPlayers });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-amber-400 mb-8">Create Test Game</h1>

        <Card variant="medieval" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Game ID</label>
                <Input
                  type="number"
                  value={formData.gameId.toString()}
                  onChange={(e) => setFormData({ ...formData, gameId: parseInt(e.target.value, 10) || 0 })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-amber-500/30 rounded text-amber-300"
                >
                  <option value="1v1">1v1</option>
                  <option value="2v2">2v2</option>
                  <option value="3v3">3v3</option>
                  <option value="4v4">4v4</option>
                  <option value="5v5">5v5</option>
                  <option value="6v6">6v6</option>
                  <option value="ffa">FFA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Name</label>
              <Input
                value={formData.gamename}
                onChange={(e) => setFormData({ ...formData, gamename: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration (seconds)</label>
                <Input
                  type="number"
                  value={formData.duration.toString()}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value, 10) || 0 })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Map</label>
                <Input
                  value={formData.map}
                  onChange={(e) => setFormData({ ...formData, map: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Players</label>
              <div className="space-y-3">
                {formData.players.map((player, index) => (
                  <div key={index} className="flex gap-2 items-center p-3 bg-black/20 rounded">
                    <Input
                      value={player.name}
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      placeholder="Player name"
                      className="flex-1"
                    />
                    <select
                      value={player.flag}
                      onChange={(e) => updatePlayer(index, 'flag', e.target.value)}
                      className="px-3 py-2 bg-black/40 border border-amber-500/30 rounded text-amber-300"
                    >
                      <option value="winner">Winner</option>
                      <option value="loser">Loser</option>
                      <option value="drawer">Draw</option>
                    </select>
                    {formData.players.length > 2 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removePlayer(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={addPlayer}>
                  + Add Player
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400">
                Error: {error}
              </div>
            )}

            {result && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded text-green-400">
                {result}
              </div>
            )}

            <Button type="submit" variant="amber" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Game'}
            </Button>
          </form>
        </Card>

        <Card variant="medieval" className="p-6 mt-6">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/games" className="block text-amber-300 hover:text-amber-200">
              → View All Games
            </a>
            <a href="/standings" className="block text-amber-300 hover:text-amber-200">
              → View Leaderboard
            </a>
            {formData.players.length > 0 && (
              <a
                href={`/players/${encodeURIComponent(formData.players[0].name)}`}
                className="block text-amber-300 hover:text-amber-200"
              >
                → View {formData.players[0].name}'s Profile
              </a>
            )}
          </div>
        </Card>
    </div>
  );
}

