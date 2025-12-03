import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/features/infrastructure/components';

interface PlayerFilterProps {
  allies?: string[];
  enemies?: string[];
  onChange: (allies: string[], enemies: string[]) => void;
  placeholder?: string;
}

export function PlayerFilter({
  allies = [],
  enemies = [],
  onChange,
  placeholder = 'Search players...',
}: PlayerFilterProps) {
  const [alliesSearch, setAlliesSearch] = useState('');
  const [enemiesSearch, setEnemiesSearch] = useState('');
  const [alliesSuggestions, setAlliesSuggestions] = useState<string[]>([]);
  const [enemiesSuggestions, setEnemiesSuggestions] = useState<string[]>([]);
  const [showAlliesSuggestions, setShowAlliesSuggestions] = useState(false);
  const [showEnemiesSuggestions, setShowEnemiesSuggestions] = useState(false);
  const alliesInputRef = useRef<HTMLInputElement>(null);
  const enemiesInputRef = useRef<HTMLInputElement>(null);
  const alliesDropdownRef = useRef<HTMLDivElement>(null);
  const enemiesDropdownRef = useRef<HTMLDivElement>(null);

  // Search for players
  useEffect(() => {
    const searchPlayers = async (query: string, setSuggestions: (suggestions: string[]) => void) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return;
        
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Filter out already selected players
          const filtered = data.data.filter((name: string) => 
            !allies.includes(name) && !enemies.includes(name)
          );
          setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
        }
      } catch {
        // Silently fail - search is non-critical
        setSuggestions([]);
      }
    };

    const alliesTimeout = setTimeout(() => {
      if (alliesSearch) {
        searchPlayers(alliesSearch, setAlliesSuggestions);
      } else {
        setAlliesSuggestions([]);
      }
    }, 300); // Debounce search

    const enemiesTimeout = setTimeout(() => {
      if (enemiesSearch) {
        searchPlayers(enemiesSearch, setEnemiesSuggestions);
      } else {
        setEnemiesSuggestions([]);
      }
    }, 300);

    return () => {
      clearTimeout(alliesTimeout);
      clearTimeout(enemiesTimeout);
    };
  }, [alliesSearch, enemiesSearch, allies, enemies]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        alliesDropdownRef.current &&
        !alliesDropdownRef.current.contains(event.target as Node) &&
        alliesInputRef.current &&
        !alliesInputRef.current.contains(event.target as Node)
      ) {
        setShowAlliesSuggestions(false);
      }
      if (
        enemiesDropdownRef.current &&
        !enemiesDropdownRef.current.contains(event.target as Node) &&
        enemiesInputRef.current &&
        !enemiesInputRef.current.contains(event.target as Node)
      ) {
        setShowEnemiesSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addAlly = (playerName: string) => {
    if (!allies.includes(playerName)) {
      onChange([...allies, playerName], enemies);
    }
    setAlliesSearch('');
    setShowAlliesSuggestions(false);
  };

  const removeAlly = (playerName: string) => {
    onChange(allies.filter(name => name !== playerName), enemies);
  };

  const addEnemy = (playerName: string) => {
    if (!enemies.includes(playerName)) {
      onChange(allies, [...enemies, playerName]);
    }
    setEnemiesSearch('');
    setShowEnemiesSuggestions(false);
  };

  const removeEnemy = (playerName: string) => {
    onChange(allies, enemies.filter(name => name !== playerName));
  };

  return (
    <Card variant="medieval" className="p-4">
      <div className="space-y-4">
        {/* Allies Section */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Allies</label>
          <div className="relative">
            <input
              ref={alliesInputRef}
              type="text"
              value={alliesSearch}
              onChange={(e) => {
                setAlliesSearch(e.target.value);
                setShowAlliesSuggestions(true);
              }}
              onFocus={() => setShowAlliesSuggestions(true)}
              placeholder={placeholder}
              className="w-full px-3 py-3 md:py-2 bg-black/40 border border-amber-500/30 rounded text-amber-300 focus:outline-none focus:border-amber-400 min-h-[44px] md:min-h-0"
            />
            {showAlliesSuggestions && alliesSuggestions.length > 0 && (
              <div
                ref={alliesDropdownRef}
                className="absolute z-10 w-full mt-1 bg-black/90 border border-amber-500/30 rounded shadow-lg max-h-60 overflow-y-auto"
              >
                {alliesSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => addAlly(name)}
                    className="w-full text-left px-3 py-3 md:py-2 text-amber-300 hover:bg-amber-500/20 focus:bg-amber-500/20 focus:outline-none min-h-[44px] md:min-h-0"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {allies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {allies.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-200 rounded text-sm"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeAlly(name)}
                    className="hover:text-green-100 focus:outline-none min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={`Remove ${name} from allies`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Enemies Section */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Enemies</label>
          <div className="relative">
            <input
              ref={enemiesInputRef}
              type="text"
              value={enemiesSearch}
              onChange={(e) => {
                setEnemiesSearch(e.target.value);
                setShowEnemiesSuggestions(true);
              }}
              onFocus={() => setShowEnemiesSuggestions(true)}
              placeholder={placeholder}
              className="w-full px-3 py-3 md:py-2 bg-black/40 border border-amber-500/30 rounded text-amber-300 focus:outline-none focus:border-amber-400 min-h-[44px] md:min-h-0"
            />
            {showEnemiesSuggestions && enemiesSuggestions.length > 0 && (
              <div
                ref={enemiesDropdownRef}
                className="absolute z-10 w-full mt-1 bg-black/90 border border-amber-500/30 rounded shadow-lg max-h-60 overflow-y-auto"
              >
                {enemiesSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => addEnemy(name)}
                    className="w-full text-left px-3 py-3 md:py-2 text-amber-300 hover:bg-amber-500/20 focus:bg-amber-500/20 focus:outline-none min-h-[44px] md:min-h-0"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {enemies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {enemies.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-200 rounded text-sm"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeEnemy(name)}
                    className="hover:text-red-100 focus:outline-none min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={`Remove ${name} from enemies`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


