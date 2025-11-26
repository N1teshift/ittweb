import React, { useState, useEffect } from 'react';

interface DateSelectorProps {
  dateType: 'single' | 'undated';
  singleDate: string;
  approximateText: string;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type DatePrecision = 'year' | 'month' | 'day';

export default function DateSelector({ dateType, singleDate, approximateText, onFieldChange }: DateSelectorProps) {
  // Determine precision from existing date value
  const getPrecision = (dateStr: string): DatePrecision => {
    if (!dateStr) return 'month';
    if (/^\d{4}$/.test(dateStr)) return 'year';
    if (/^\d{4}-\d{2}$/.test(dateStr)) return 'month';
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
    } else if (currentPrecision === 'month') {
      setInputValue(singleDate);
    } else {
      // Full date
      setInputValue(singleDate);
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
      } else if (newPrecision === 'month') {
        const monthValue = inputValue.substring(0, 7);
        setInputValue(monthValue);
        const syntheticEvent = {
          target: { name: 'singleDate', value: monthValue }
        } as React.ChangeEvent<HTMLInputElement>;
        onFieldChange(syntheticEvent);
      }
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Format based on precision
    let formattedValue = value;
    if (precision === 'year' && value.length >= 4) {
      formattedValue = value.substring(0, 4);
    } else if (precision === 'month' && value.length >= 7) {
      formattedValue = value.substring(0, 7);
    }

    const syntheticEvent = {
      target: { name: 'singleDate', value: formattedValue }
    } as React.ChangeEvent<HTMLInputElement>;
    onFieldChange(syntheticEvent);
  };

  return (
    <div>
      <label className="block text-amber-500 mb-2">Date Information</label>
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
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-amber-500 mb-2">Date Precision</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
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
              <label className="flex items-center">
                <input
                  type="radio"
                  name="datePrecision"
                  value="month"
                  checked={precision === 'month'}
                  onChange={() => handlePrecisionChange('month')}
                  className="mr-2"
                />
                Year & Month
              </label>
              <label className="flex items-center">
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
          </div>

          <div>
            <label className="block text-amber-500 mb-2">Date</label>
            {precision === 'year' ? (
              <input
                type="number"
                name="singleDate"
                value={inputValue}
                onChange={handleDateInputChange}
                min="1900"
                max="2100"
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                placeholder="2025"
              />
            ) : precision === 'month' ? (
              <input
                type="month"
                name="singleDate"
                value={inputValue || ''}
                onChange={handleDateInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            ) : (
              <input
                type="date"
                name="singleDate"
                value={inputValue || ''}
                onChange={handleDateInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            )}
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
