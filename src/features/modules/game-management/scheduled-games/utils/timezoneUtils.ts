/**
 * Timezone utilities for handling global player scheduling
 */

/**
 * Get the user's timezone (browser's timezone)
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'UTC';
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a UTC date/time string to a specific timezone
 */
export function convertToTimezone(utcDateTime: string, targetTimezone: string): Date {
  const date = new Date(utcDateTime);
  return new Date(date.toLocaleString('en-US', { timeZone: targetTimezone }));
}

/**
 * Format a date/time for display in a specific timezone
 */
export function formatDateTimeInTimezone(
  utcDateTime: string,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcDateTime);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short',
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

/**
 * Convert a local date/time to UTC ISO string
 * Takes a date string (YYYY-MM-DD), time string (HH:mm), and timezone, and converts to UTC
 * 
 * This function works by finding the UTC time that, when displayed in the target timezone,
 * equals the provided local date/time.
 */
export function convertLocalToUTC(
  dateString: string,
  timeString: string,
  timezone: string
): string {
  // Parse components
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create a date string in ISO format (without timezone)
  const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  // We need to find what UTC time produces this local time in the target timezone
  // Strategy: Start with a guess, check what it looks like in the target timezone, adjust
  
  // Start with the date as if it's UTC
  let candidateDate = new Date(`${isoString}Z`);
  
  // Format this candidate in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  // Use a binary search approach to find the correct UTC time
  // We'll iterate a few times to converge on the correct time
  for (let i = 0; i < 10; i++) {
    const parts = formatter.formatToParts(candidateDate);
    const tzYear = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const tzMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0');
    const tzDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
    const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    
    // Check if we've found the correct time
    if (tzYear === year && tzMonth === month && tzDay === day && tzHour === hours && tzMinute === minutes) {
      break;
    }
    
    // Calculate the difference
    const targetLocal = new Date(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute);
    const desiredLocal = new Date(year, month - 1, day, hours, minutes);
    const diffMs = desiredLocal.getTime() - targetLocal.getTime();
    
    // Adjust the candidate date
    candidateDate = new Date(candidateDate.getTime() + diffMs);
  }
  
  return candidateDate.toISOString();
}

/**
 * Get a list of common timezones for selection
 */
export function getCommonTimezones(): Array<{ value: string; label: string }> {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)' },
  ];
}

/**
 * Get timezone abbreviation for display
 */
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    return tzPart?.value || timezone;
  } catch {
    return timezone;
  }
}


