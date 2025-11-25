'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { ITTIconCategory } from '@/features/ittweb/guides/utils/iconUtils';
import { getSuggestions } from './icon-mapper.utils';
import type { IconFile, IconMapping } from './icon-mapper.types';

type IconItemProps = {
  icon: IconFile;
  existingMapping: string | undefined;
  onUpdate: (filename: string, gameName: string) => void;
  onRemove: (gameName: string) => void;
  allMappings: IconMapping;
};

export default function IconItem({ icon, existingMapping, onUpdate, onRemove, allMappings }: IconItemProps) {
  const [gameName, setGameName] = useState(existingMapping || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGameName(existingMapping || '');
  }, [existingMapping]);

  useEffect(() => {
    if (gameName.length > 0) {
      const newSuggestions = getSuggestions(icon.category as ITTIconCategory, gameName, allMappings);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [gameName, icon.category, allMappings]);

  const handleChange = (value: string) => {
    setGameName(value);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      const newName = gameName.trim();
      if (newName && newName !== existingMapping) {
        if (existingMapping) {
          onRemove(existingMapping);
        }
        onUpdate(icon.filename, newName);
      } else if (!newName && existingMapping) {
        onRemove(existingMapping);
      }
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setGameName(suggestion);
    setShowSuggestions(false);
    onUpdate(icon.filename, suggestion);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        selectSuggestion(suggestions[selectedSuggestionIndex]);
      } else {
        e.currentTarget.blur();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Tab' && selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedSuggestionIndex]);
    }
  };

  // Get the best match for ghost preview
  const ghostPreview = useMemo(() => {
    if (!gameName || suggestions.length === 0) return '';
    const bestMatch = suggestions[0];
    if (bestMatch && bestMatch.toLowerCase().startsWith(gameName.toLowerCase())) {
      return bestMatch.substring(gameName.length);
    }
    return '';
  }, [gameName, suggestions]);

  return (
    <div className="bg-black/20 border border-amber-500/20 rounded-lg p-3 hover:border-amber-500/50 transition-colors">
      <div className="flex flex-col items-center gap-2">
        <Image
          src={icon.path}
          alt={icon.filename}
          width={64}
          height={64}
          className="border border-amber-500/30 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/itt/items/enabled/BTNYellowHerb.png';
          }}
        />
        <div className="w-full relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Game name..."
              value={gameName}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm bg-black/30 border border-amber-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 relative z-10"
            />
            {/* Ghost preview */}
            {ghostPreview && showSuggestions && (
              <div className="absolute left-2 top-1 text-sm text-gray-500 pointer-events-none z-0">
                <span className="invisible">{gameName}</span>
                <span className="text-gray-500/50">{ghostPreview}</span>
              </div>
            )}
          </div>
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-20 w-full mt-1 bg-black/95 border border-amber-500/50 rounded-lg shadow-lg max-h-40 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-amber-500/20 transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-amber-500/30' : ''
                  }`}
                >
                  <span className="text-white">{gameName}</span>
                  <span className="text-amber-400">{suggestion.substring(gameName.length)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center truncate w-full" title={icon.filename}>
          {icon.subdirectory && <span className="text-gray-600">{icon.subdirectory}/</span>}
          {icon.filename}
        </p>
      </div>
    </div>
  );
}

