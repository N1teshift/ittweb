'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { ITTIconCategory } from '@/features/modules/content/guides/utils/iconUtils';
import type { IconFile, IconMapping, IconMappingEntry } from '@/features/modules/tools-group/tools/types/icon-mapper.types';

type IconItemProps = {
  icon: IconFile;
  allMappingsForIcon: IconMappingEntry[];
  onUpdate: (category: ITTIconCategory, filename: string, gameName: string) => void;
  onRemove: (category: ITTIconCategory, gameName: string) => void;
  allMappings: IconMapping;
  isMarkedForDeletion: boolean;
  onToggleMarkForDeletion: (iconPath: string) => void;
  gameNameOptions: Record<ITTIconCategory, string[]>;
};

export default function IconItem({ icon, allMappingsForIcon, onUpdate, onRemove, allMappings, isMarkedForDeletion, onToggleMarkForDeletion, gameNameOptions }: IconItemProps) {
  const [selectedCategory, setSelectedCategory] = useState<ITTIconCategory>('items');
  const [gameName, setGameName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddMapping, setShowAddMapping] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const imageErrorHandledRef = useRef(false);
  
  // Check if filename has special characters that cause issues with Next.js Image
  const hasSpecialChars = /[%&!()]/.test(icon.filename);
  
  // Check if current input is a valid game name
  const isValidGameName = useMemo(() => {
    if (!gameName.trim()) return true; // Empty is valid (not yet entered)
    const validNames = gameNameOptions[selectedCategory] ?? [];
    if (validNames.length === 0) return true;
    return validNames.some(name => name.toLowerCase() === gameName.trim().toLowerCase());
  }, [gameName, selectedCategory, gameNameOptions]);

  useEffect(() => {
    if (gameName.length > 0) {
      const validNames = gameNameOptions[selectedCategory] ?? [];
      const existingNames = Object.keys(allMappings[selectedCategory] ?? {});
      const combined = Array.from(new Set([...existingNames, ...validNames]));
      const query = gameName.toLowerCase();
      const newSuggestions = combined
        .filter((name) => name.toLowerCase().startsWith(query) && name.toLowerCase() !== query)
        .sort()
        .slice(0, 5);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [gameName, selectedCategory, allMappings, gameNameOptions]);

  const handleChange = (value: string) => {
    setGameName(value);
    setIsInvalid(false); // Reset invalid state when user types
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      const newName = gameName.trim();
      if (newName) {
        // Get valid game names for this category
        const validNames = gameNameOptions[selectedCategory] ?? [];
        // If no data available, allow any name (user can enter manually)
        const isValidName = validNames.length === 0 || validNames.some(name => name.toLowerCase() === newName.toLowerCase());
        
        if (!isValidName) {
          // Invalid name - show error and keep the input for correction
          setIsInvalid(true);
          return;
        }
        
        // Check if this mapping already exists
        const existing = allMappingsForIcon.find(
          m => m.category === selectedCategory && m.gameName === newName
        );
        if (!existing) {
          onUpdate(selectedCategory, icon.filename, newName);
          setGameName('');
          setShowAddMapping(false);
          setIsInvalid(false);
        }
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
    onUpdate(selectedCategory, icon.filename, suggestion);
    setGameName('');
    setShowAddMapping(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        selectSuggestion(suggestions[selectedSuggestionIndex]);
      } else {
        // Validate before submitting
        const newName = gameName.trim();
        if (newName) {
        const validNames = gameNameOptions[selectedCategory] ?? [];
        const isValidName = validNames.length === 0 || validNames.some(name => name.toLowerCase() === newName.toLowerCase());
          
          if (!isValidName) {
            setIsInvalid(true);
            e.preventDefault();
            return;
          }
        }
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

  const categoryColors: Record<ITTIconCategory, string> = {
    abilities: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    items: 'bg-green-500/20 text-green-300 border-green-500/30',
    buildings: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    trolls: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    units: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };

  const categories: ITTIconCategory[] = ['abilities', 'items', 'buildings', 'trolls'];

  return (
    <div className={`bg-black/20 border rounded-lg p-3 hover:border-amber-500/50 transition-colors relative ${
      isMarkedForDeletion 
        ? 'border-red-500/50 bg-red-500/10' 
        : 'border-amber-500/20'
    }`}>
      {isMarkedForDeletion && (
        <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
          DELETE
        </div>
      )}
      <div className="flex flex-col items-center gap-2">
        {hasSpecialChars ? (
          <>
            {/* Next/Image cannot handle filenames with certain special characters, so fall back to <img>. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={icon.path}
              alt={icon.filename}
              width={64}
              height={64}
              className="border border-amber-500/30 rounded"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                // Prevent infinite loop: only set fallback once and check if already using fallback
                if (!imageErrorHandledRef.current && !img.src.includes('BTNYellowHerb.png')) {
                  imageErrorHandledRef.current = true;
                  img.src = '/icons/itt/BTNYellowHerb.png';
                }
              }}
            />
          </>
        ) : (
          <Image
            src={icon.path}
            alt={icon.filename}
            width={64}
            height={64}
            className="border border-amber-500/30 rounded"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              // Prevent infinite loop: only set fallback once and check if already using fallback
              if (!imageErrorHandledRef.current && !img.src.includes('BTNYellowHerb.png')) {
                imageErrorHandledRef.current = true;
                img.src = '/icons/itt/BTNYellowHerb.png';
              }
            }}
          />
        )}
        
        {/* Existing Mappings */}
        {allMappingsForIcon.length > 0 && (
          <div className="w-full space-y-1">
            {allMappingsForIcon.map((mapping) => (
              <div
                key={`${mapping.category}-${mapping.gameName}`}
                className={`flex items-center justify-between px-2 py-1 rounded text-xs border ${categoryColors[mapping.category]}`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-medium">{mapping.gameName}</span>
                  <span className="opacity-60">({mapping.category})</span>
                </div>
                <button
                  onClick={() => onRemove(mapping.category, mapping.gameName)}
                  className="text-red-400 hover:text-red-300 ml-2"
                  title="Remove mapping"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Mapping */}
        {!showAddMapping ? (
          <button
            onClick={() => setShowAddMapping(true)}
            className="w-full px-2 py-1 text-xs bg-black/30 border border-amber-500/30 rounded text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            + Add Mapping
          </button>
        ) : (
          <div className="w-full space-y-2">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as ITTIconCategory);
                setGameName('');
                setSuggestions([]);
                setIsInvalid(false);
              }}
              className="w-full px-2 py-1 text-xs bg-black/30 border border-amber-500/30 rounded text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="relative">
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
                  className={`w-full px-2 py-1 text-xs bg-black/30 border rounded text-white placeholder-gray-500 focus:outline-none relative z-10 ${
                    isInvalid
                      ? 'border-red-500 focus:border-red-400'
                      : isValidGameName || !gameName.trim()
                      ? 'border-amber-500/30 focus:border-amber-400/50'
                      : 'border-yellow-500/50 focus:border-yellow-400/70'
                  }`}
                />
                {isInvalid && gameName.trim() && (
                  <div className="text-xs text-red-400 mt-1">
                    Invalid name. Please select from suggestions or enter a valid {selectedCategory} name.
                  </div>
                )}
                {/* Ghost preview */}
                {ghostPreview && showSuggestions && (
                  <div className="absolute left-2 top-1 text-xs text-gray-500 pointer-events-none z-0">
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
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-amber-500/20 transition-colors ${
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
            <button
              onClick={() => {
                setShowAddMapping(false);
                setGameName('');
                setSuggestions([]);
              }}
              className="w-full px-2 py-1 text-xs bg-black/30 border border-gray-500/30 rounded text-gray-400 hover:bg-gray-500/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center truncate w-full" title={icon.filename}>
          {icon.subdirectory && <span className="text-gray-600">{icon.subdirectory}/</span>}
          {icon.filename}
        </p>
        
        {/* Mark for Deletion Button */}
        <button
          onClick={() => onToggleMarkForDeletion(icon.path)}
          className={`w-full px-2 py-1 text-xs rounded transition-colors ${
            isMarkedForDeletion
              ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500'
              : 'bg-black/30 border border-gray-500/30 text-gray-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400'
          }`}
          title={isMarkedForDeletion ? 'Unmark for deletion' : 'Mark for deletion'}
        >
          {isMarkedForDeletion ? '✓ Marked for Deletion' : 'Mark for Deletion'}
        </button>
      </div>
    </div>
  );
}



