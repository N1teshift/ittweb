import React, { useState, useEffect } from 'react';

interface DateSelectorProps {
  dateType: 'single' | 'undated';
  singleDate: string;
  approximateText: string;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type DatePrecision = 'year' | 'day';

export default function DateSelector({ dateType, singleDate, approximateText, onFieldChange }: DateSelectorProps) {
  // Determine precision from existing date value
  const getPrecision = (dateStr: string): DatePrecision => {
    if (!dateStr) return 'day';
    if (/^\d{4}$/.test(dateStr)) return 'year';
    // If it's YYYY-MM format, treat it as day precision (convert to YYYY-MM-01)
    if (/^\d{4}-\d{2}$/.test(dateStr)) return 'day';
    return 'day';
  };

  const [precision, setPrecision] = useState<DatePrecision>(getPrecision(singleDate));
  const [inputValue, setInputValue] = useState<string>('');

  // Convert stored date to input format based on precision
  useEffect(() => {
    if (!singleDate) {
      setInputValue('');
      return;
    }

    const currentPrecision = getPrecision(singleDate);
    setPrecision(currentPrecision);

    if (currentPrecision === 'year') {
      setInputValue(singleDate);
    } else {
      // For day precision, if we have YYYY-MM format, convert to YYYY-MM-01 for date input
      if (/^\d{4}-\d{2}$/.test(singleDate)) {
        setInputValue(singleDate + '-01');
      } else {
        // Full date
        setInputValue(singleDate);
      }
    }
  }, [singleDate]);

  const handlePrecisionChange = (newPrecision: DatePrecision) => {
    setPrecision(newPrecision);
    // Convert current value to new precision
    if (inputValue) {
      if (newPrecision === 'year') {
        const year = inputValue.substring(0, 4);
        setInputValue(year);
        const syntheticEvent = {
          target: { name: 'singleDate', value: year }
        } as React.ChangeEvent<HTMLInputElement>;
        onFieldChange(syntheticEvent);
      }
      // For day precision, no conversion needed - keep the full date
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Format based on precision
    let formattedValue = value;
    if (precision === 'year' && value.length >= 4) {
      formattedValue = value.substring(0, 4);
    }
    // For day precision, keep the full date value

    const syntheticEvent = {
      target: { name: 'singleDate', value: formattedValue }
    } as React.ChangeEvent<HTMLInputElement>;
    onFieldChange(syntheticEvent);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-amber-500">Date Information</label>
        {dateType === 'single' && (
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center text-sm">
              <input
                type="radio"
                name="datePrecision"
                value="year"
                checked={precision === 'year'}
                onChange={() => handlePrecisionChange('year')}
                className="mr-2"
              />
              Year only
            </label>
            <label className="flex items-center text-sm">
              <input
                type="radio"
                name="datePrecision"
                value="day"
                checked={precision === 'day'}
                onChange={() => handlePrecisionChange('day')}
                className="mr-2"
              />
              Full Date
            </label>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="dateType"
            value="single"
            checked={dateType === 'single'}
            onChange={onFieldChange}
            className="mr-2"
          />
          Date
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
          <label className="block text-amber-500 mb-2">Date *</label>
            {precision === 'year' ? (
              <input
                type="number"
                name="singleDate"
                value={inputValue}
                onChange={handleDateInputChange}
                min="1900"
                max="2100"
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                placeholder="2025"
              />
            ) : (
              <input
                type="date"
                name="singleDate"
                value={inputValue || ''}
                onChange={handleDateInputChange}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            )}
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


