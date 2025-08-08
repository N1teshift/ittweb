import React from 'react';

interface DateSelectorProps {
  dateType: 'single' | 'interval' | 'undated';
  singleDate: string;
  startDate: string;
  endDate: string;
  approximateText: string;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DateSelector({ dateType, singleDate, startDate, endDate, approximateText, onFieldChange }: DateSelectorProps) {
  return (
    <div>
      <label className="block text-amber-500 mb-2">Date Information</label>
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="radio"
            name="dateType"
            value="single"
            checked={dateType === 'single'}
            onChange={onFieldChange}
            className="mr-2"
          />
          Single date
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="dateType"
            value="interval"
            checked={dateType === 'interval'}
            onChange={onFieldChange}
            className="mr-2"
          />
          Date range
        </label>

        <label className="flex items-center">
          <input
            type="radio"
            name="dateType"
            value="undated"
            checked={dateType === 'undated'}
            onChange={onFieldChange}
            className="mr-2"
          />
          Undated
        </label>
      </div>

      {dateType === 'single' && (
        <div className="mt-3">
          <label className="block text-amber-500 mb-2">Date</label>
          <input
            type="date"
            name="singleDate"
            value={singleDate}
            onChange={onFieldChange}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      )}

      {dateType === 'interval' && (
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-amber-500 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={onFieldChange}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-amber-500 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={onFieldChange}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {dateType === 'undated' && (
        <div className="mt-3">
          <label className="block text-amber-500 mb-2">Approximate Time (Optional)</label>
          <input
            type="text"
            name="approximateText"
            value={approximateText}
            onChange={onFieldChange}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            placeholder="e.g., Early 2016, Circa 2015, Unknown..."
          />
        </div>
      )}
    </div>
  );
}
