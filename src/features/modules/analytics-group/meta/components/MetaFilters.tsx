/**
 * Meta Page Filters Component
 */

import React from 'react';
import { Card } from '@/features/infrastructure/components';

interface MetaFiltersProps {
  category: string;
  teamFormat: string;
  startDate: string;
  endDate: string;
  onCategoryChange: (value: string) => void;
  onTeamFormatChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

export function MetaFilters({
  category,
  teamFormat,
  startDate,
  endDate,
  onCategoryChange,
  onTeamFormatChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: MetaFiltersProps) {
  return (
    <Card variant="medieval" className="p-6">
      <h2 className="text-xl font-semibold text-amber-400 mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-amber-400 mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="3v3">3v3</option>
            <option value="4v4">4v4</option>
            <option value="5v5">5v5</option>
            <option value="6v6">6v6</option>
            <option value="ffa">FFA</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="teamFormat" className="block text-sm font-medium text-amber-400 mb-2">
            Team Format
          </label>
          <select
            id="teamFormat"
            value={teamFormat}
            onChange={(e) => onTeamFormatChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Formats</option>
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="3v3">3v3</option>
            <option value="4v4">4v4</option>
            <option value="5v5">5v5</option>
            <option value="6v6">6v6</option>
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-amber-400 mb-2">
            From Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-amber-400 mb-2">
            To Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </Card>
  );
}


