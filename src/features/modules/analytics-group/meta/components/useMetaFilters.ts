/**
 * Custom hook for managing meta page filters with debouncing
 */

import { useState, useEffect } from 'react';

interface MetaFilters {
  category: string;
  teamFormat: string;
  startDate: string;
  endDate: string;
}

interface DebouncedMetaFilters {
  debouncedCategory: string;
  debouncedTeamFormat: string;
  debouncedStartDate: string;
  debouncedEndDate: string;
}

const DEBOUNCE_DELAY = 300;

export function useMetaFilters(): MetaFilters & DebouncedMetaFilters & {
  setCategory: (value: string) => void;
  setTeamFormat: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  resetFilters: () => void;
} {
  const [category, setCategory] = useState<string>('');
  const [teamFormat, setTeamFormat] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [debouncedCategory, setDebouncedCategory] = useState<string>('');
  const [debouncedTeamFormat, setDebouncedTeamFormat] = useState<string>('');
  const [debouncedStartDate, setDebouncedStartDate] = useState<string>('');
  const [debouncedEndDate, setDebouncedEndDate] = useState<string>('');

  // Debounce filter inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategory(category);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTeamFormat(teamFormat);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [teamFormat]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStartDate(startDate);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [startDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEndDate(endDate);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [endDate]);

  const resetFilters = () => {
    setCategory('');
    setTeamFormat('');
    setStartDate('');
    setEndDate('');
  };

  return {
    category,
    teamFormat,
    startDate,
    endDate,
    debouncedCategory,
    debouncedTeamFormat,
    debouncedStartDate,
    debouncedEndDate,
    setCategory,
    setTeamFormat,
    setStartDate,
    setEndDate,
    resetFilters,
  };
}


